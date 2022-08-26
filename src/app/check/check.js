const trans = require('./api')

async function check(client, fn) {
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
    fn();
}

module.exports = {
    check,
}
