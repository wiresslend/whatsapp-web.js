const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('./src/whatsapp-web.js/index');
const { statusReport, uploadQR, WorkerStatus } = require('./src/dispatch/dispatch');
const { parseConfig } = require('./src/config/config');
const { check } = require('./src/app/check/check');
const sendApi = require('./src/app/send/api');
const { send } = require('./src/app/send/send');
const { MapWithDeadLine } = require('./src/app/send/utils.js')


let globalStore = {
    client: null,
    name: '',
    _status: 0,
    cap: 0,
    num: '',
    is_banned: true,
    loopId: null,
    sleepTime: 5000,
    qrCounts: 0,
    tids: new MapWithDeadLine(120),
}

function doJob(client){
    check(client, () => { globalStore.cap += 1});
    send(client, globalStore.name, (msgId, tid) => { globalStore.tids.set(msgId, tid)});
}

function registerClientEvent(client){
    client.on('qr', qr => {
        console.log("QR:", qr)
        globalStore.qrCounts += 1;
        if(globalStore.qrCounts >= 10){
            destroyClient()
            report()
            return
        }
        qrcode.generate(qr, {small: true});
        uploadQR(globalStore.name, qr)
        globalStore._status = WorkerStatus.WorkerStatusWaitScanQR
        report()
    });
    
    client.on('ready', () => {
        globalStore._status = WorkerStatus.WorkerStatusLoginSucc
        report()
        globalStore._status = WorkerStatus.WorkerStatusNormal
        console.log('Client is ready!');
        console.log('client info', client.info)
        globalStore.num = client.info.wid.user;
        globalStore.is_banned = false;
    	globalStore.loopId = setInterval(() => { doJob(client) }, globalStore.sleepTime * 1000)
    });
    
    client.on('message', message => {
            console.log(`Receive: {from: ${message.from}, body: ${message.body}`);
            //message.reply(message.body);
    });
    
    client.on('message_ack', async(msg, ack) => {
        /*
            == ACK VALUES ==
            ACK_ERROR: -1
            ACK_PENDING: 0
            ACK_SERVER: 1
            ACK_DEVICE: 2
            ACK_READ: 3
            ACK_PLAYED: 4
        */
        console.log(`ACK: {number: ${msg.to}, ack: ${ack}, msg: ${msg.id.id}}`);
        let tid = globalStore.tids.get(msg.id.id)
        if(!tid) {
            console.error("task Id not found")
            return
        }
        let _status = sendApi.TaskStatus.StatusSending
        switch(ack) {
        case -1:
            _status= sendApi.TaskStatus.StatusFailed;
            globalStore.tids.del(msg.id)
            break
        case 1:
            _status= sendApi.TaskStatus.StatusServerAck;
            break
        case 2:
            _status= sendApi.TaskStatus.StatusDeviceAck;
            break
        case 3:
            _status= sendApi.TaskStatus.StatusRead;
            globalStore.tids.del(msg.id)
            break
        }
        console.log("update sending task status tid:", tid, "status", _status);
        let resp = await sendApi.updateStatus(tid, _status);
        console.log("update sending task status response:", resp)
    })
    
    client.on('auth_failure', msg => {
        console.error("AUTHENTICATION FAILURE", msg)
        destroyClient();
        report();
   });
    
    client.on('disconnected', (reason) => {
        console.log('Client was logged out', reason);
        destroyClient()
        report()
    });
}

function newClient(){
    let initOption = {puppeteer:{headless: false}};
    initOption.authStrategy = new LocalAuth();
    let client = new Client(initOption);
    registerClientEvent(client);
    return client;
}

function destroyClient(){
    if(globalStore.loopId) {
        clearInterval(globalStore.loopId);
    }
    globalStore.is_banned = true;
    globalStore._status = WorkerStatus.WorkerStatusOffline;
    globalStore.qrCounts = 0;
    globalStore.num = '';
    clearInterval(globalStore.loopId);
    globalStore.client.destroy();
    globalStore.client = null;
}

async function init(){
    const name = await parseConfig();
    if(!name) {
        throw new Error('can not find a client name!');
    }
    globalStore.name = name.name;
    report();
    setInterval(report, 60*1000);
}

async function report() {
    console.log(`report status: name: ${globalStore.name}, cap: ${globalStore.cap}, banned: ${globalStore.is_banned}`);
    let resp = await statusReport(globalStore.name, globalStore.num,  globalStore.cap, globalStore._status, 'w20220927.1');
    console.log("globalStore", globalStore);
    if(!resp) {
        return
    }
    if(resp.status == WorkerStatus.WorkerStatusStartClient && globalStore.client === null){
        globalStore.client = newClient();
        await globalStore.client.initialize();
    }
    if(resp.sleep != globalStore.sleepTime) {
        console.log("sleep time updated, new sleep time is:", resp.sleep)
        globalStore.sleepTime = resp.sleep;
        if(globalStore.loopId) {
            clearInterval(globalStore.loopId);
            globalStore.loopId = setInterval(() => { doJob(globalStore.client) }, globalStore.sleepTime * 1000);
        }
    }
}

init();
