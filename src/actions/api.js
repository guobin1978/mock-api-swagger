const inquirer = require('inquirer');
const request = require('request');
const path = require('path');
const ora = require('ora');
const requestPromise = require('../utils/requestPromise');
const createApiList = require('../service/createApiList');
const createApiFile = require('../service/createApiFile');

const data = {};
const getType = async (filePath, t) => {
    if(!t) {
        const choices = ['1.只生成接口地址', '2.生成接口函数'];
        const { type } = await inquirer.prompt([
            {
              type: 'list',
              name: 'type',
              message: '请选择生成的类型：',
              choices,
              filter(res) {
                return choices.indexOf(res);
              }
            }
        ])
        t = type + 1;
    }

    const apiConfig = require(path.join(filePath, './mock/apiConfig.js'));
    const { urls } = apiConfig;
    const spinner = ora('JSON数据拉取。。。').start();
    spinner.color = 'green';
    spinner.text = 'JSON数据拉取中。。。';
    Object.keys(urls).forEach(key => {
        requestPromise({
            url: urls[key],
            method: 'get',
            json: true,
            query: {
                group: 'webapi'
            }
        }).then(body => {
            spinner.succeed('数据拉取成功');
            const { basePath } = body;
            if(!data[key]) {
                data[key] = createApiList(body);
                createApiFile(data[key], basePath, body.definitions, filePath, t);
            }
        }).catch(err => {
            spinner.succeed('数据拉取失败');
        })
    })
}
module.exports = getType;