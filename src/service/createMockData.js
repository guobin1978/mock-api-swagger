const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const ajax = require('./ajax');
const res = require('express/lib/response');

const getHost = (proxy, url, config={}) => {
    Object.keys(proxy).forEach(p => {
        if(url.includes(p)) {
            config = proxy[p];
            if(proxy[p].children) {
                config = getHost(proxy[p].children, url, config);
            }
        }
    })
    return config;
}

router.use('/', async function (req, res) {
    const filePath = process.cwd();
    const mockData = require(path.join(filePath, './mock/data.json'));
    const { proxy } = require(path.join(filePath, './mock/apiConfig'))
    const href = req.url.split('?')[0]; // 获取请求地址
    const {  host, port } = getHost(proxy, href);
    const url = `http://${host}:${port}${href}`; // 根据配置文件拼接相应后端请求地址
    const timeout = href.includes('/file') ? 30000 : 3000;
    req.query = req.query || {};
    req.body = req.body || {};
    const config = {
        url,
        timeout,
        method: req.method,
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body,
        json: true
    }
    const mock = mockData || {};
    if(req.query.isMock || req.body.isMock && mock[href]) {
        res.send(mock[href]);
        return;
    }
    const { body, error } = await ajax({ req, res, config });
    if(body) {
        res.send(body);
        mock[href] = body;
        // 生成mock数据
        fs.writeFileSync(path.join(filePath, './mock/data.json', JSON.stringify(mock, "", "\t"), { 'flag': 'w' }));
    } else {
        // 请求失败返回mock数据
        if(mock[href]) {
            res.send(mock[href]);
            return;
        }
        res.send(error); // 无mock数据返回null
    }
})
module.exports = router;