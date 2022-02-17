const inquirer = require('inquirer');
const request = require('request');
const path = require('path');
const ora = require('ora');
const requestPromise = require('../utils/requestPromise');
const createApiList = require('../service/createApiList');
const createApiFile = require('../service/createApiFile');
const { promise } = require('ora');

const data = {};
const getType = async (filePath, apiModulePath) => {
    const apiConfig = require(path.join(filePath, './mock/apiConfig.js'));
    const { urls } = apiConfig;
    const spinner = ora('JSON数据拉取。。。').start();
    spinner.color = 'green';
    spinner.text = 'JSON数据拉取中。。。';
    const httpObject = {}
    if(!Array.isArray(urls)) {
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
                    createApiFile(data[key], basePath, body.definitions, filePath, apiModulePath);
                }
            }).catch(err => {
                spinner.succeed('数据拉取失败');
            })
        })

    } else {
        Object.keys(urls).forEach(key => {
            httpObject[key] = urls[key].map(url => requestPromise({
                url: url,
                method: 'get',
                json: true,
                query: {
                    group: 'webapi'
                }
            }))
            promise.all(httpObject[key]).then(list => {
                spinner.succeed(key + '数据拉取成功');
                httpObject[key] = list.map((body, index) => createApiList(body)).flat()
                createApiFile(httpObject[key], key, filePath, apiModulePath);
            })
        })
    }
}
module.exports = getType;