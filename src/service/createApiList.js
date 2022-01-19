const createName= (path) => {
    let nameArr = path.slice(1).replace(/\/\{.*}/).split('/');
    let firstName = nameArr[0];
    if(firstName.includes('-')) {
        const _arr = firstName.split('-');
        firstName = _arr.slice(1).reduce((t, cc) => t + cc.slice(0, 1).toUpperCase() + cc.slice(1), _arr[0])
    }
    let name = nameArr.slice(1).reduce((total, c) => {
        if(c.includes('-')) {
            const _arr = c.split('-');
            c = _arr.slice(1).reduce((t, cc) => t + cc.slice(0, 1).toUpperCase() + cc.slice(1), _arr[0])
        }
        return total + c.slice(0, 1).toUpperCase() + c.slice(1);
    }, firstName.slice(0, 1).toLowerCase() + firstName.slice(1));
    return name;
}
const createApiList = (body) => {
    let { basePath, paths, definitions } = body;
    let arr = [];
    Object.keys(paths).forEach((key, i) => {
        // params传参路径会有{}
        let methods = paths[key];
        if(!methods) return;
        const methodList = Object.keys(methods);
        for(let i = 0; i < methodList.length; i++) {
            const method = methodList[i];
            const item = {
                name: createName(key) + method.slice(0, 1).toUpperCase() + method.slice(1),
                path: key,
                remake: methods[method].summary,
                parameters: methods[method].parameters,
                method
            }
            arr.push(item);
        }
    })
    return arr;
}

module.exports = createApiList;