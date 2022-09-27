const { getTask, updateStatus } = require('./api')

async function send(client, name, fn) {
    let data = await getTask(name)
    console.log("get sending task, data:", data)
    if(!data){
        console.log("get sending task error!");
        return
    }
    console.log("get send task", data.number, data.content, data.id);
    if(!data.number || !data.content || !data.id) {
        return
    }
    const number_details = await client.getNumberId(data.number); // get mobile number details
    console.log('number detail:', number_details)
    if (number_details) {
        const msg = await client.sendMessage(number_details._serialized, data.content); // send message
        console.log(`Send msg: {from: ${msg.from}, to: ${msg.to}, content: ${msg.body}}, id ${msg.id.id}`);
        fn(msg.id.id, data.id);
    } else {
        console.log(data.number, "Mobile number is not registered");
        let resp = await updateStatus(data.id, 7);
        console.log("update sending task status response:", resp)
    }
}

module.exports = {
    send,
}
