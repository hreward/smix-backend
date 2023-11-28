// config.js
const config = require('./config.cfg');
const fs = require('fs');
const util = require('util');
const writeFileAsync = util.promisify(fs.writeFile);



  function getConfig(){
    return config
  }
  async function updateConfig(newConfig){
    const serializedConfig = `module.exports = ${JSON.stringify(newConfig || config, null, 4)};\n`;
    try {
      await writeFileAsync('config.cfg', serializedConfig, 'utf-8');
      console.log('Config file updated');
    } catch (error) {
      console.error('Error updating config file:', error);
    }
  }

module.exports = {getConfig, updateConfig}