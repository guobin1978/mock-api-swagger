const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const router = require('./createMockData')

const filePath = process.cwd();
const apiConfig = require(path.join(filePath, './mock/apiConfig.js'));
const dataPath = path.join(filePath, './mock/data.json');

if(!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '{}', { 'flag': 'w' });
}

// 设置跨域访问
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With, yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
})
app.use(express.json());

app.use('/', function(req, res) {
    const proxy = apiConfig.proxy;
    const isProxy = Object.keys(proxy).some(p => req.url.includes(p));
    // 判断url是否走代理
    if(isProxy) {
        router(req, res);
        return;
    }
})

console.log('mock at http://localhost:3456');
app.listen(3456);