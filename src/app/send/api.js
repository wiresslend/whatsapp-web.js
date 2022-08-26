const axios = require("axios").default;

const baseUrl = "https://z.abcdemo.xyz/warobot";
const apiAuth = {'username':'bank', 'password':'knab'};

async function getTask(name) {
    let url = baseUrl + '/task/get'
    try{
        let resp = await axios.get(url, {auth: apiAuth, params: {'name': name}});
        console.log(`get task from ${url}, response:`, resp.data)
        return resp.data.data
    } catch(e) {
        console.error(`get task from ${url}, error:`, e)
    }
}

async function updateStatus(tid, _status) {
    let url = baseUrl + '/task/update'
    try {
        let resp = await axios.post(url, {'tid': tid, 'status': _status}, {auth: apiAuth});
        console.log(`update status to ${url}, response:`,resp.data)
        return resp.data.data
    } catch(e) {
        console.error(`update status to ${url}, error:`, e)
    }
}

const TaskStatus = {
    StatusInit: 0,
	StatusSending: 1,                   //Sending status
    StatusServerAck: 2,
    StatusDeviceAck: 3,
    StatusRead: 4,
	StatusFailed: 5,                    //Job send failed
	StatusCanceled: 6,                  //Job canceled
}

module.exports = {
    getTask,
    updateStatus,
    TaskStatus,
}
//getTask("051b1f1c-9029-4d5a-81d5-bf393a2ee243").then((data) => console.log(data))
//updateStatus(1, 1).then((data) => console.log(data))
