const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

const filePath = process.cwd();
const apiConfig = require(path.join(filePath, './mock/apiConfig.js'));

// 设置跨域访问
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
})

const getRouter = (proxy, url='', config={}) => {
    Object.keys(proxy).forEach(p => {
        if(proxy[p].children) {
            getRouter(proxy[p].children, url + p, config)
        }
        const { host, port } = proxy[p];
        config[url + p] = `${host.includes('http') ? host : 'http://' + host}:${port ? ':' + port : ''}`
    })
    return config
}

const getMock = (proxy, url='', config={}) => {
    Object.keys(proxy).forEach(p => {
        if(proxy[p].children) {
            getMock(proxy[p].children, url + p, config)
        }
        const { data, mock } = proxy[p]
        console.log(p, proxy[p])
        if(data) {
            config[url + p] = { data, mock }
        }
    })
    return config
}

let port = process.argv.splice(2)[0]
if(port === 'undefined') {
    port = 3456
}
const optionsRouter = getRouter(apiConfig.proxy)
console.log(optionsRouter)

const mock = getMock(apiConfig.proxy)
console.log('mock', mock)
// proxy 中间件的选择项
var options = {
    target: `http://localhost:${port}`, // 目标服务器 host
    changeOrigin: true,               // 默认false，是否需要改变原始主机头为目标URL
    ws: true,                         // 是否代理websockets
    router: optionsRouter,
    onError(err, req, res, target) {
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end(err.toString ? err.toString() : err);
    },
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const response = responseBuffer; // convert buffer to string
        let data = response.toString('utf-8')
        try {
            data = JSON.parse(data)
        } catch(e) {}
        let ip = getClientIp(req).match(/\d+.\d+.\d+.\d+/)
        ip = ip ? ip.join('.') : null
        console.log(ip, req._parseUrl.pathname, data.code)
        return response; // manipulate response and return the result
      }),
    
}

const proxyMiddleware = createProxyMiddleware(options)

app.use('/', function(...args) {
    const [req, res] = args
    const url = req._parsedUrl.pathname
    console.log(url)
    if(mock[url] && mock[url].mock) {
        console.log(url, 'mock')
        res.send(mock[url].data)
    } else {
        proxyMiddleware(...args)
    }
})

app.listen(port);