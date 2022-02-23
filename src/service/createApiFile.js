const path = require('path');
const fs = require('fs');
const ejs = require('ejs')

const createApi = (list, baseUrl, filePath, apiModulePath) => {
    let apiPath = '';// 文件夹路径
    if(!apiModulePath) {
        apiPath = path.join(filePath, '/src', '/api')
    } else {
        apiPath = path.join(filePath, apiModulePath)
    }

    const apiFilePath = path.join(apiPath, `${baseUrl}.js`); // 文件路径

    const apiTemPath = path.join(filePath, `./mock/api.ejs`); // 模板文件路径

    // 判断是否有api文件夹
    if(!fs.existsSync(apiPath)) {
        fs.mkdirSync(apiPath);
    }
    // 判断是否有api模块文件
    if(fs.existsSync(apiFilePath)) {
        fs.unlinkSync(apiFilePath);
    }

    ejs.renderFile(apiTemPath, { baseUrl, list }, function(err, data) {
        try {
            fs.writeFileSync(apiFilePath, data, { 'flag': 'w' });
        } catch(e) {
            console.log(e);
        }
    })
}

module.exports = createApi;