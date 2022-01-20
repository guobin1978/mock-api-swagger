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
        json: true
    }
    console.log(req.headers['content-type'])
    const mock = mockData || {};
    if(Object.keys(req.query).length > 0) {
        config.qs = req.query
    }
    if(Object.keys(req.body).length > 0) {
        if(req.headers['content-type'] === 'application/json') {
            config.body = JSON.stringify(req.body)
        }
        if(req.headers['content-type'] === 'application/x-www-form-urlencoded') {
            config.form = JSON.stringify(req.body)
        }
        if(req.headers['content-type'] === 'multipart/form-data') {
            config.formData = JSON.stringify(req.body)
        }
    }
    if(req.query.isMock || req.body.isMock && mock[href]) {
        res.send(mock[href]);
        return;
    }
    if(req.headers['content-type'] === 'multipart/form-data') {
        request(url).pipe(req)
        return
    }
    request(config, function(error, response, body) {
        if(response && response.statusCode === 200) {
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
})
module.exports = router;