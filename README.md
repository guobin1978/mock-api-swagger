# mock-api-swagger

> swagger数据请求转发生成mock及api生成

## Install

```
npm install -g mock-api-swagger
```

## Usage
```
创建mock文件夹
mock
--apiConfig.js 请求i地址设置 proxy设置
module.exports = {
    urls: {
        'orderManager': 'http://127.0.0.1:5010/orderManager/api.json?group=webapi', // swagger的json地址
    },
    proxy: {
        '/orderManager': {
            host: '127.0.0.1',
            port: '5010',
            children: {
                '/file': {
                    host: 'other host',
                    port: 'other port', 
                },
                '/order': {
                    host: 'other host',
                    port: 'other port', 
                }
            }
        }
    }
}

--data.json // mock数据留存

```
### 初始化文件
```
mas init
```
### 生成api文件
> src同级目录运行会在src文件夹生成api文件夹
```
mas 先初始化文件
mas api
```

### 启动mock
```
mas mock
```