const path = require('path');
const fs = require('fs');

const createApiPath = (list, basePath, definitions, filePath) => {
    const apiPath = path.join(filePath, './src/api'); // 文件夹路径
    const apiFilePath = path.join(filePath, `./src/api/${basePath}.js`); // 文件路径

    // 判断是否有api文件夹
    if(!fs.existsSync(apiPath)) {
        fs.mkdirSync(apiPath);
    }
    // 判断是否有api模块文件
    if(fs.existsSync(apiFilePath)) {
        fs.unlinkSync(apiFilePath);
    }
    let str = 'module.export = {\n'
    list.forEach(item => {
        str += `\t${item.name}: '${item.path}', // ${item.remake}\n`
    })
    str += '}'
    try {
        fs.writeFileSync(apiFilePath, str, { 'flag': 'w' });
    } catch(e) {
        console.log(e);
    }
}

const createApiFunction = (list, basePath, definitions, filePath) => {
    const apiPath = path.join(filePath, './src/api'); // 文件夹路径
    const apiFilePath = path.join(filePath, `./src/api/${basePath}.js`); // 文件路径

    // 判断是否有api文件夹
    if(!fs.existsSync(apiPath)) {
        fs.mkdirSync(apiPath);
    }
    // 判断是否有api模块文件
    if(fs.existsSync(apiFilePath)) {
        fs.unlinkSync(apiFilePath);
    }
    let str = "import request from '@/utils/http'"
    list.forEach(item => {
        str += `\n\n/**`;
        str += `\n * @description: ${ item.remake }`;
        str += `\n * @param: {*} data`;
        str += `\n * @return: {*}`;
        str += `\n **/`;
        str += `\nexport function ${item.name}(data) {`;
        str += `\n\treturn request.${item.method}('${item.path}', data)`;
        str += `\n}`;
    })
    try {
        fs.writeFileSync(apiFilePath, str, { 'flag': 'w' });
    } catch(e) {
        console.log(e);
    }
}

module.exports = function(list, basePath, definitions, filePath, type) {
    if(+type === 1) {
        createApiPath(list, basePath, definitions, filePath);
    } else if(+type === 2) {
        createApiFunction(list, basePath, definitions, filePath);
    }
};