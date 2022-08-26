const axios = require('axios').default

async function statusReport(name, account, check_tasks, _status, version) {
    const url = 'https://z.abcdemo.xyz/warobot/internal/report'
    const _auth = {'username':'bank', 'password':'knab'}
    const payload = {
        name,
        account,
        check_tasks,
        "status": _status,
        version
    }
    try {
        const res = await axios.get(url, {auth: _auth, params: payload});                                                                            console.log(`status report to ${url}, response:`, res.data)
        return res.data.data
    } catch (err){
        console.log(`status report to ${url}, error:`, err)
    }
}

async function uploadQR(name, qr) {
    const url = "https://z.abcdemo.xyz/warobot/internal/qrcode"
    const _auth = {'username':'bank', 'password':'knab'}
    const data = {name, qr}
    try {
        const res = await axios.post(url, data, {auth: _auth})
        console.log(`upload qrcode to ${url}, response:`, res.data)
    } catch (err) {
        console.log(`upload qrcode to ${url}, error:`, err)
    }
}

const WorkerStatus = {
    //WorkerStatusInit Worker已启动，监控进程已启动，web.js客户端未启动
    WorkerStatusInit: 0,
    
    //WorkerStatusStartClient 服务端设置此状态后客户端启动web.js客户端
    WorkerStatusStartClient: 10,
    
    //WorkerStatusStartSucc Worker启动web.js成功，暂时未使用
    WorkerStatusStartSucc: 11,
    
    //WorkerStatusStartFailed Worker启动web.js失败， 暂时未使用
    WorkerStatusStartFailed: 12,
    
    //WorkerStatusWaitQR 等待生成二维码
    WorkerStatusWaitQR: 20,
    
    //WorkerStatusWaitScanQR 二维码已生成，等待扫码
    WorkerStatusWaitScanQR: 21,
    
    //WorkerStatusLoginSucc 登录成功
    WorkerStatusLoginSucc: 22,
    
    //WorkerStatusNormal 登录成功后，如无其它情况，后续心跳上报的状态
    WorkerStatusNormal: 30,
    
    //WorkerStatusSleep 保持登录状态，但不接受任何任务
    WorkerStatusSleep: 31,
    
    //WorkerStatusMaintain 维护模式，养号模式，不接受普通任务，接受养号任务
    WorkerStatusMaintain: 32,
    
    //WorkerStatusOffline 账号离线, 可能的case有：退出登录、 账号被Banned等，此时web.js客户端被销毁
    //如需重新启动，需要服务端将状态置为 WorkerStatusStartClient
    WorkerStatusOffline: 41,
    
    //WorkerStatusDead Worker异常
    //Worker超过指定时间未报心跳
    WorkerStatusDead: -1,
}

module.exports = {
    statusReport,
    uploadQR,
    WorkerStatus,
}
