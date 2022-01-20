const fs = require('fs');
const path = require('path');
const ora = require('ora');

const init = async (filePath) => {
    const spinner = ora('文件初始化。。。').start();
    spinner.color = 'green';
    const mockPath = path.join(filePath, './mock'); // 文件夹路径
    const apiConfigPath = path.join(filePath, './mock/apiConfig.js')
    const apiPath = path.join(filePath, './src/api'); // 文件夹路径
    const apiTemPath = path.join(filePath, './mock/api.ejs')
    const dataPath = path.join(filePath, './mock/data.json');
    
    try {
        // 判断是否有mock文件夹
        if(!fs.existsSync(mockPath)) {
            fs.mkdirSync(mockPath);
        }

        // 判断是否有apiConfigPath文件夹
        if(!fs.existsSync(apiConfigPath)) {
            fs.createReadStream(path.join(__dirname, '../utils/apiConfig.js')).pipe(fs.createWriteStream(apiConfigPath));
        }

        // 判断是否有api文件夹
        if(!fs.existsSync(apiPath)) {
            fs.mkdirSync(apiPath);
        }

        // 判断是否有api模板文件
        if(!fs.existsSync(apiTemPath)) {
            fs.createReadStream(path.join(__dirname, '../utils/api.ejs')).pipe(fs.createWriteStream(apiTemPath));
        }
        
        // 判断是否有data.json
        if(!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, '{}', { 'flag': 'w' });
        }
        spinner.succeed('文件初始化成功');
    } catch(e) {
        spinner.succeed('文件初始化失败');
        console.log(e)
    }
}
module.exports = init;