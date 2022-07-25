const execa = require('execa');
const path = require('path')
const Chokidar = require('chokidar');

const createMockServer = path.join(__dirname, '../service/createMockServer.js')
const mock = (filePath, port) => {
    let subprocess; // 子进程
    // 用户代理设置文件
    const mock = path.join(process.cwd(), './mock');

    // 监听设置文件是否修改
    const watcher = Chokidar.watch([mock], {
      persistent: true,
      usePolling: true,
    });
    
    watcher
    .on('add', path => {})
    .on('ready', () => {
        console.log(`ready`)
        subprocess = execa('node', [createMockServer, port]);
        subprocess.stdout.pipe(process.stdout);
    })
    .on('change', path => {
        console.log(`Has been changed, file: ${path}`);
        // 文件有修改重启
        subprocess.kill('SIGKILL');
        subprocess = execa('node', [createMockServer, port])
        subprocess.stdout.pipe(process.stdout);
    })
}

module.exports = mock;