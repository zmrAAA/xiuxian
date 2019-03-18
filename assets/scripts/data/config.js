const DEBUG = false;
module.exports = {
    debug: DEBUG,
    http: {
        url: DEBUG ? '' : ''
    },
    socket: {
        url: DEBUG ? '' : ''
    }
};