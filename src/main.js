const fs = require('fs');
const path = require('path');
const program = require('commander');
const { version } = require('./utils/constants');
const { mapActions } = require('./utils/common');

Reflect.ownKeys(mapActions).forEach((action)=>{
  program.command(action) //配置命令的名字
    .alias(mapActions[action].alias) // 命令的别名
    .description(mapActions[action].description) // 命令对应的描述
    .action(() => {  //动作
      if(action === '*'){  //访问不到对应的命令 就打印找不到命令
          console.log(mapActions[action].description); 
      }else{
          // 分解命令 到文件里 有多少文件 就有多少配置 create config
            // lee-cli create project-name ->[node,lee-cli,create,project-name]
          const mockPath = path.join(process.cwd(), './mock/'); // 文件夹路径

          if(!fs.existsSync(mockPath)) {
            fs.mkdirSync(mockPath)
          }
          require(path.join(__dirname, './actions', action))(process.cwd(), ...process.argv.slice(3));
      }
    })
});

program.version(version)
  .parse(process.argv); // process.argv就是用户在命令行中传入的参数

// 监听用户的help事件
program.on('--help', () => {
  console.log('\nExamples:');
  Reflect.ownKeys(mapActions).forEach((action) => {
      mapActions[action].examples.forEach((example) => {
          console.log(` ${example}`);
      })
  })})