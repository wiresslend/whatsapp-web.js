const axios = require('axios').default;
const fs = require('fs')

const configFile = './config/config.json'

const apiAuth = {'username':'bank', 'password':'knab'}
const jobSource = ['online', 'online_bak', 'online_bak2', 'online_bak3']

const apis = {
    "online": {
        "stack_lenth": "https://abcdemo.xyz/iswhatsapp/status/",
        "get_task": "http://abcdemo.xyz/iswhatsapp/mpop/?n=1&timeout=60",
        "save_data": "http://abcdemo.xyz/iswhatsapp/save/",
        "confirm": "http://abcdemo.xyz/iswhatsapp/confirm/"
    },
    "online_bak": {
        "stack_lenth": "https://bak.abcdemo.xyz/iswhatsapp/status/",
        "get_task": "https://bak.abcdemo.xyz/iswhatsapp/mpop/?n=1&timeout=60",
        "save_data": "https://bak.abcdemo.xyz/iswhatsapp/save/",
        "confirm": "https://bak.abcdemo.xyz/iswhatsapp/confirm/"
    },
    "online_bak2": {
        "stack_lenth": "https://bak2.abcdemo.xyz/iswhatsapp/status/",
        "get_task": "https://bak2.abcdemo.xyz/iswhatsapp/mpop/?n=1&timeout=60",
        "save_data": "https://bak2.abcdemo.xyz/iswhatsapp/save/",
        "confirm": "https://bak2.abcdemo.xyz/iswhatsapp/confirm/"
    },
    "online_bak3": {
        "stack_lenth": "https://bak3.abcdemo.xyz/iswhatsapp/status/",
        "get_task": "https://bak3.abcdemo.xyz/iswhatsapp/mpop/?n=1&timeout=60",
        "save_data": "https://bak3.abcdemo.xyz/iswhatsapp/save/",
        "confirm": "https://bak3.abcdemo.xyz/iswhatsapp/confirm/"
    },
}

async function parseConfig() {
    try {
        fs.accessSync(configFile, fs.constants.F_OK);
        const data = fs.readFileSync(configFile, 'UTF-8').toString();
        let config = JSON.parse(data)
        return config
    } catch {
        console.log(`config file(${configFile}) not exist, will init new one!`)
        let name = await initConfig();
        saveConfig({name})
        return {name}
    }
}


function saveConfig(cfg) {
    console.log("save config:", cfg)
    fs.writeFileSync(configFile, JSON.stringify(cfg))
}

async function initConfig() {
    const url = "https://z.abcdemo.xyz/wa1/sercontroller/init";
    const _auth = {'username':'whatsapp_tools', 'password':'matrix'}
    try {
        console.log(_auth)
        let res = await axios.get(url, {auth: _auth})
        console.log(`request from ${url}, response:`, res.data)
        return res.data.name
    } catch (err) {
        console.log(`request from ${url}, error:`, err)
    }
}

async function report(name, num, cap, is_banned, task_type, version) {
    const url = 'https://z.abcdemo.xyz/wa1/sercontroller/alive'
    const _auth = {'username':'whatsapp_tools', 'password':'matrix'}
    const payload = {
        name,
        num,
        cap,
        is_banned,
        task_type,
        version
    }
    try {
        const res = await axios.get(url, {auth: _auth, params: payload});
        console.log(`status report to ${url}, response:`, res.data)
        return res.data.slp_time
    } catch (err){
        console.log(`status report to ${url}, error:`, err)
    }
}

async function getStackLength(source){
    let url = apis[source]['stack_lenth'];
    let len = 0
    await axios.get(url, {auth: apiAuth}).then(res => {
        console.log(`get stack length from ${url}, response:`, res.data)
        len = res.data.stack_length + res.data.retry_queue_length
    }).catch(err => {
        console.log(`get stack length from ${url}, error:`, err)
    })
	return len;
}

async function getJob(source){
    let url = apis[source]['get_task'];
    let data = {}
    await axios.get(url, {auth: apiAuth}).then(res => {
        console.log(`get job from ${url}, response:`, res.data)
        if(res.data.status === 'ok') {
	        data = res.data.message
        }
    }).catch(err => {
        console.log(`get job from ${url}, error:`, err)
    })
	return data
}

async function saveData(source, data){
    let url = apis[source]['save_data'];
    axios.get(url, {auth: apiAuth, params: data}).then(res => {
        console.log(`save data to ${url}, response:`, res.data)
    }).catch(err => {
        console.log(`save data to ${url}, error:`, err)
    })
}

async function confirmJob(source, data){
    let url = apis[source]['confirm'];
    axios.get(url, {auth: apiAuth, params: data}).then(res => {
        console.log(`confirm to ${url}, response:`, res.data)
    }).catch(err => {
        console.log(`confirm to ${url}, error:`, err)
    })
}

async function getOneJob(){
	for(let i = 0; i < jobSource.length; i++){
		s = jobSource[i]
		let len = await getStackLength(s);
		if(len === 0) {
			continue
		}
		let jobs = await getJob(s);
		if(jobs && jobs.length > 0) {
			let job = jobs[0];
			job.value = new Buffer(job.value, 'base64').toString();
			job.value = job.value.replace('+', '')
			job.source = s;
			return job;
		}
	};
}


module.exports = {
    getStackLength,
    getOneJob,
    saveData,
    confirmJob,
    jobSource,
    parseConfig,
    report
}