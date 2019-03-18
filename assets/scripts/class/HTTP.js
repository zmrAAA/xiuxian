/**网络请求
 *
 */
const URL = require('config').http.url;
const HTTP = (function () {
    'use strict';
    function HTTP() {
    };

    /**发送请求
     *
     * @param mode              请求类型
     * @param path              请求路径
     * @param data              请求数据
     * @param callback          成功回调函数
     * @param remedyCallback    失败回调函数
     * @param extraUrl          服务器地址,没有使用默认地址
     */
    HTTP.prototype.send = function (mode, path, data, callback, remedyCallback, extraUrl = URL) {
        var ajax_Data = null;
        var fn = function (xhr, status) {
            if (status === 'success') {
                // Global.log("http res json:", xhr.responseText);
                var ret = null;
                try {
                    ret = JSON.parse(xhr.responseText);
                    // Global.log("http res obj:", ret);
                    if (ret.code != 200) {
                        Global.log(ajax_Data);
                        Global.log("http res obj:", ret);
                        remedyCallback && remedyCallback(ret);
                        return;
                    }
                } catch (e) {
                    Global.log(ajax_Data);
                    Global.log("http res json:", xhr.responseText);
                    remedyCallback && remedyCallback(xhr.responseText);
                }
                callback && callback(ret);
            } else {
                Global.log(ajax_Data);
                Global.log("http res json:", xhr.responseText);
                remedyCallback && remedyCallback(xhr.responseText);
            }
            ajax_Data = null;
            fn = null;
            xhr = null;
        };

        ajax_Data = {
            url: extraUrl + path,
            type: mode,
            data: data,
            complete: fn
        };
        $.ajax(ajax_Data);
    };

    return HTTP;
}());
module.exports = HTTP;