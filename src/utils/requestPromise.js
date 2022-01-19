const request = require('request');

module.exports = function(config) {
    return new Promise((resolve, reject) => {
        request(config,
        function(error, response, body) {
            if(!body) {
                reject(error);
                return;
            };
            resolve(body);
        })
    })
}