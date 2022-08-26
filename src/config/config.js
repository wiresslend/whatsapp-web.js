const axios = require('axios').default;
const fs = require('fs')

const configFile = './.config/config.json'

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
    const url = "https://z.abcdemo.xyz/warobot/internal/new";
    const _auth = {'username':'bank', 'password':'knab'}
    try {
        console.log(_auth)
        let res = await axios.get(url, {auth: _auth})
        console.log(`request from ${url}, response:`, res.data)
        return res.data.data.name
    } catch (err) {
        console.log(`request from ${url}, error:`, err)
    }
}

module.exports = {
    parseConfig,
}
