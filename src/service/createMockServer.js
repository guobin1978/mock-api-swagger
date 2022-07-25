const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const fileCheck = require('../utils/fileCheck')

if(!fileCheck.hasMock()) {
    fileCheck.init()
}

const filePath = process.cwd();
const apiConfig = require(path.join(filePath, './mock/apiConfig.js'));
const mockData = require(path.join(filePath, './mock/data.js'));

// 设置跨域访问
app.use(cors())

const getRouter = (proxy, url='', config={}) => {
    Object.keys(proxy).forEach(p => {
        if(proxy[p].children) {
            getRouter(proxy[p].children, url + p, config)
        }
        const { host, port } = proxy[p];
        config[url + p] = `${host.includes('http') ? host : 'http://' + host}${port ? ':' + port : ''}`
    })
    return config
}

const getMock = (proxy, url='', config={}) => {
    Object.keys(proxy).forEach(p => {
        if(proxy[p].children) {
            getMock(proxy[p].children, url + p, config)
        }
        const { mock } = proxy[p]
        
        if(mock) {
            config[url + p] = { mock }
        }
    })
    return config
}

const getClientIp = function (req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || ''
}

let port = process.argv.splice(2)[0]
if(port === 'undefined') {
    port = 3456
}
const optionsRouter = getRouter(apiConfig.proxy)
console.log(optionsRouter)

const mock = getMock(apiConfig.proxy)

// proxy 中间件的选择项
var options = {
    target: `http://localhost:${port}`, // 目标服务器 host
    changeOrigin: true,               // 默认false，是否需要改变原始主机头为目标URL
    ws: true,                         // 是否代理websockets
    router: optionsRouter,
    selfHandleResponse: true, // 是否启用自定义回调函数
    onError(err, req, res, target) {
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end(err.toString ? err.toString() : err);
    },
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const response = responseBuffer
        let data = response.toString('utf-8')
        let ip, url, code
        try {
            data = JSON.parse(data)
            code = data ? data.code : null
            ip = getClientIp(req).match(/\d+.\d+.\d+.\d+/)
            ip = ip ? ip.join('.') : null
            const { _parseUrl: { pathname: pathname1 } = {}, _parsedUrl: { pathname: pathname2 } = {} } = req
            url = pathname1 || pathname2
            console.log('ip:', ip, 'url:', url, 'status:', res.statusCode, 'code:', code)
        } catch(e) {}
        return response
    })
}

const proxyMiddleware = createProxyMiddleware(options)

app.use('/', function(...args) {
    const [req, res] = args
    const url = req._parsedUrl.pathname
    if(mock[url] && mock[url].mock) {
        console.log(url, 'mock')
        if(mockData[url].status) {
            res.status(mockData[url].status)
        }
        res.send(mockData[url].data)
    } else {
        proxyMiddleware(...args)
    }
})

app.listen(port);