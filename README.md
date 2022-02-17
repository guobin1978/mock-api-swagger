# mock-api-swagger

> swagger数据请求转发生成mock及api生成

## Install

```
npm install -g mock-api-swagger
```

## Usage
### 初始化文件
> 默认在当前路径生成mock配置文件夹
```
mas init
```
### 生成api文件
> 默认在当前路径src下生成api文件夹 <path> 指定路径
```
mas api <path>
```

### 启动mock
> <port> 指定端口（开启第二个服务必须指定端口）
```
mas mock <port>
```