if (!CC_EDITOR) {
    const URL = require('config').socket.url,
        ws = URL ? new WebSocket(URL) : {};

    var onEvent = {};

    ws.onmessage = function (e) {
        var data = e.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(e.data);
            } catch (e) {
                console.log('WS onmessage JSON.parse Error', e);
            }
        }
        console.log(data);
        var events = onEvent[data.type], i;
        if (events) {
            i = events.length - 1
            for (; i >= 0; i--) {
                events[i](data);
            }
        }
    }

    ws.onerror = function (e) {
        ws.close();
        console.log('WebSocket.Error:', e);
    }

    ws.onclose = function (e) {
        console.log('WebSocket.close:', e);
    }

    ws.onopen = function () {
        cc.vv.EventTarget.emit('wsOpen');
    }

    module.exports = {
        ws: ws,
        send(type, data) {
            if (!data) {
                data = {};
            }
            data.type = type;
            try {
                data = JSON.stringify(data);
            } catch (e) {
                console.log('WebSocket 发送数据出错');
            }
            ws.send(data);
        },

        on(type, cb) {
            if (!onEvent[type]) {
                onEvent[type] = [];
            }
            onEvent[type].push(cb);
        }
    };
}