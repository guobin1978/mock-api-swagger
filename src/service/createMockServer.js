const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
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

const getRouter = (proxy, url, config={}) => {
    Object.keys(proxy).forEach(p => {
        if(proxy[p].children) {
            getHost(proxy[p].children, p, config)
        }
        const { host, port } = proxy[p];
        config[url + p] = `http://${host}:${port}`
    })
    return config
}

let port = process.argv.splice(2)[0]
if(port === 'undefined') {
    port = 3456
}

// proxy 中间件的选择项
var options = {
    target: `http://localhost:${port}`, // 目标服务器 host
    changeOrigin: true,               // 默认false，是否需要改变原始主机头为目标URL
    ws: true,                         // 是否代理websockets
    router: getRouter(apiConfig.proxy),
    onError(err, req, res, target) {
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end(err.toString ? err.toString() : err);
    },
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const response = responseBuffer; // convert buffer to string
        return response; // manipulate response and return the result
      }),
    
};
app.use('/', createProxyMiddleware(options))

console.log(`mock at http://localhost:${port}`);
app.listen(port);