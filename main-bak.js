const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("./whatsapp-web.js/index");
const trans = require("./app/check/api.js");

let initOption = {};
initOption.authStrategy = new LocalAuth();

const client = new Client(initOption);

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Client is ready!");
    console.log("client info", client.info);
    ClientStatus.num = client.info.wid.user;
    ClientStatus.is_banned = false;
    ClientStatus.loopId = setInterval(start, ClientStatus.sleepTime * 1000);
});

client.on("message", (message) => {
    console.log(`Receive: {from: ${message.from}, body: ${message.body}`);
    //message.reply(message.body);
});

client.on("message_ack", (msg, ack) => {
    console.log(`ACK: {number: ${msg.to}, ack: ${ack}}`);
});

client.on("auth_failure", (msg) => {
    console.error("AUTHENTICATION FAILURE", msg);
});

client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
    if (ClientStatus.loopId) {
        clearInterval(ClientStatus.loopId);
    }
    ClientStatus.is_banned = true;
});

let ClientStatus = {
    name: "",
    cap: 0,
    num: "",
    is_banned: true,
    loopId: null,
    sleepTime: 5000,
};

async function start() {
    let job = await trans.getOneJob();
    if (!job) {
        return;
    }
    let data = {
        number: "+" + job.value,
        wa: "no",
        isb: "",
        ste: "",
        status: "",
        av: "",
        key: job.key,
    };
    const numberDetail = await client.isWAUser(job.value);
    if (numberDetail) {
        data.wa = "yes";
        //isb
        data.isb = numberDetail.biz;
        //status
        const wid = numberDetail.wid._serialized;
        let sta = await client.getStatus(wid);
        data.ste = sta ? sta.status : "";
        //picture
        let picUrl = await client.getProfilePicUrl(wid);
        console.log(picUrl);
        data.av = picUrl ? "yes" : "no";
    } else {
        data.wa = "no";
    }
    await trans.saveData(job.source, data);
    await trans.confirmJob(job.source, { key: data.key });
    ClientStatus.cap += 1;
}

async function init() {
    const name = await trans.parseConfig();
    if (!name) {
        throw new Error("can not find a client name!");
    }
    ClientStatus.name = name.name;
    report();
    setInterval(report, 60 * 1000);
}

async function report() {
    console.log(
        `report status: name: ${ClientStatus.name}, cap: ${ClientStatus.cap}, banned: ${ClientStatus.is_banned}`
    );
    let sleepTime = await trans.report(
        ClientStatus.name,
        ClientStatus.num,
        ClientStatus.cap,
        ClientStatus.is_banned,
        "online",
        "w20220722.1"
    );
    if (!sleepTime) {
        return;
    }
    if (sleepTime === ClientStatus.sleepTime) {
        return;
    }
    ClientStatus.sleepTime = sleepTime;
    if (ClientStatus.loopId) {
        clearInterval(ClientStatus.loopId);
        ClientStatus.loopId = setInterval(start, sleepTime * 1000);
    }
}

init();
client.initialize();
