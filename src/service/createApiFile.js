const path = require('path');
const fs = require('fs');
const ejs = require('ejs')
const fileCheck = require('../utils/fileCheck')

const createApi = (list, baseUrl, filePath, apiModulePath) => {
    
    let apiPath = '';// api存放路径
    if(!apiModulePath) {
        apiPath = path.join(filePath, '/src', '/api')
    } else {
        apiPath = path.join(filePath, apiModulePath)
    }

    const apiFilePath = path.join(apiPath, `${baseUrl}.js`); // 文件路径

    // 检测是否有api模板文件
    fileCheck.checkApi()

    const apiTemPath = path.join(filePath, `./mock/api.ejs`); // 模板文件路径

    // 检测是否有apiAppend模板文件
    fileCheck.checkApiAppend()

    const apiAppendTemPath = path.join(filePath, `./mock/apiAppend.ejs`); // api追加模板文件路径

    // 判断是否有api文件夹
    if(!fs.existsSync(apiPath)) {
        fs.mkdirSync(apiPath);
    }
    // 判断是否有api模块文件
    if(fs.existsSync(apiFilePath)) {
        let str = fs.readFileSync(apiFilePath)
        str = str.toString('utf-8')
        list = list.filter(item => !new RegExp(item.name + '\\b', 'g').test(str))
        ejs.renderFile(apiAppendTemPath, { baseUrl, list }, function(err, data) {
            try {
                fs.appendFileSync(apiFilePath, data);
            } catch(e) {
                console.log(e);
            }
        })     
    } else {
        ejs.renderFile(apiTemPath, { baseUrl, list }, function(err, data) {
            try {
                fs.writeFileSync(apiFilePath, data, { 'flag': 'w' });
            } catch(e) {
                console.log(e);
            }
        })
    }
}

module.exports = createApi;