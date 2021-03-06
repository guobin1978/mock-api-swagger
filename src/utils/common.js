// 根据我们想要实现的功能配置执行动作，遍历产生对应的命令
const mapActions = {
    init: {
        alias: 'i', //别名
        description: '生成api模板', // 描述
        examples: [ //用法
            'mas init'
        ]
    },
    api: {
        alias: 'a', //别名
        description: '生成api', // 描述
        examples: [ //用法
            'mas api <path>'
        ]
    },
    mock: { //配置文件
        alias: 'm', //别名
        description: '启动mock', // 描述
        examples: [ //用法
            'mas mock <port>'
        ] 
   },
    '*': {
        alias: '', //别名
        description: 'command not found', // 描述
        examples: [] //用法
            }}
module.exports = {
    mapActions
};