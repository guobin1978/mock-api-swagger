const inquirer = require('inquirer');
const path = require('path');
const ora = require('ora');
const to = require('await-to-js')
const requestPromise = require('../utils/requestPromise');
const createApiList = require('../service/createApiList');
const createApiFile = require('../service/createApiFile');

const data = {};
const getType = async (filePath, apiModulePath) => {
    const choices = ['url', 'proxy'];
    const { type } = await inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: '请选择获取的方式：',
            choices,
            filter(res) {
            return choices.indexOf(res);
            }
        }
    ])
    
    const apiConfig = require(path.join(filePath, './mock/apiConfig.js'));
    const { urls, proxy } = apiConfig;
    const spinner = ora('JSON数据拉取').start();
    spinner.color = 'green';
    if(type === 0) {
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
                spinner.succeed(key + '数据拉取成功');
                const { basePath } = body;
                if(!data[key]) {
                    data[key] = createApiList(body);
                    createApiFile(data[key], basePath, filePath, apiModulePath);
                }
            }).catch(err => {
                spinner.succeed('数据拉取失败');
            })
        })
    } else {
        let list = []
        const arr = Object.keys(proxy)
        for(let i = 0; i < arr.length; i++) {
            const baseUrl = arr[i]
            const { host, port } = proxy[baseUrl]
            const url = `http://${host}:${port}/${baseUrl}/api.json?group=webapi`
            spinner.text = `正在拉取：${baseUrl} -> ${url}`;
            const [err, body] = await to(requestPromise({
                url: url,
                method: 'get',
                json: true,
                query: {
                    group: 'webapi'
                }
            }))
            if(err && !body) {
                spinner.succeed(`${baseUrl}数据拉取失败`);
                return
            }
            spinner.succeed(`${baseUrl}数据拉取成功`);
            list = createApiList(body)
            if(!proxy[baseUrl].children) return
            const children = proxy[baseUrl].children
            const arr = Object.keys(children)
            for(let j = 0; j < arr.length; j++) {
                const routerUrl = arr[j]
                const { host, port } = children[routerUrl]
                const url = `http://${host}:${port}/${baseUrl}/api.json?group=webapi`
                spinner.text = `正在拉取：${routerUrl} -> ${url}`;
                const body = await to(requestPromise({
                    url: url,
                    method: 'get',
                    json: true,
                    query: {
                        group: 'webapi'
                    }
                }))
                if(err && !body) {
                    spinner.succeed(`${routerUrl}数据拉取失败`);
                    return
                }
                spinner.succeed(`${routerUrl}数据拉取成功`);
                list = list.filter(item => item.routerUrl !== routerUrl)
                const data = createApiList(body).filter(item => item.routerUrl === routerUrl)
                list = list.concat(data)
            }
        }
        console.log(list)
    }
}
module.exports = getType;