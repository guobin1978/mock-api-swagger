const fs = require('fs');
const path = require('path');
const ora = require('ora');

// 判断是否有mock文件夹
const hasMock = (filePath = process.cwd()) => {
    const mockPath = path.join(filePath, './mock')
    return fs.existsSync(mockPath)
}

// 判断是否有mock文件夹
const checkMock = (filePath = process.cwd()) => {
    const mockPath = path.join(filePath, './mock')
    if(!fs.existsSync(mockPath)) {
        fs.mkdirSync(mockPath);
    }
}

// 判断是否有apiConfigPath文件
const checkApiConfig = (filePath = process.cwd()) => {
    const apiConfigPath = path.join(filePath, './mock/apiConfig.js')
    if(!fs.existsSync(apiConfigPath)) {
        fs.createReadStream(path.join(__dirname, '../template/apiConfig.ejs')).pipe(fs.createWriteStream(apiConfigPath));
    }
}

// 判断是否有api模板文件
const checkApi = (filePath = process.cwd()) => {
    const apiTemPath = path.join(filePath, './mock/api.ejs')
    if(!fs.existsSync(apiTemPath)) {
        fs.createReadStream(path.join(__dirname, '../template/api.ejs')).pipe(fs.createWriteStream(apiTemPath));
    }
}

// 判断是否有api追加模板文件
const checkApiAppend = (filePath = process.cwd()) => {
    const apiAppendTemPath = path.join(filePath, './mock/apiAppend.ejs')
    if(!fs.existsSync(apiAppendTemPath)) {
        fs.createReadStream(path.join(__dirname, '../template/apiAppend.ejs')).pipe(fs.createWriteStream(apiAppendTemPath));
    }
}

// 判断是否有data.js
const checkData = (filePath = process.cwd()) => {
    const dataTemPath = path.join(filePath, './mock/data.js')
    if(!fs.existsSync(dataTemPath)) {
        fs.createReadStream(path.join(__dirname, '../template/data.ejs')).pipe(fs.createWriteStream(dataTemPath));
    }
}

const init = async (filePath = process.cwd()) => {
    const spinner = ora('文件初始化。。。').start();
    spinner.color = 'green';
    
    try {
        checkMock(filePath)
        checkApiConfig(filePath)
        checkApi(filePath)
        checkApiAppend(filePath)
        checkData(filePath)
        spinner.succeed('文件初始化成功')
    } catch(e) {
        spinner.succeed('文件初始化失败')
        console.log(e)
    }
}

module.exports = {
    init,
    hasMock,
    checkMock,
    checkApiConfig,
    checkApi,
    checkApiAppend,
    checkData
}