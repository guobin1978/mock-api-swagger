/**
 * request promise封装 / async封装
 */
const request = require('request');
const ajax = function({ req, res, config }) {
    return new Promise((resolve, reject) => {
        req.pipe(request(config, function(error, response, body) {
            if(response && response.statusCode === 200) {
                resolve(body);
            } else {
                reject(body);
            }
        }))
    })
}

module.exports = async function({ req, res, config }) {
    let body = null, error = null;
    try {
        body = await ajax({ req, res, config });
    } catch(e) {
        error = e;
    }
    return { body, error };
}