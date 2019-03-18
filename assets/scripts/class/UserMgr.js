/**管理用户
 *
 */
const UserMgr = (function () {
    'use strict';
    function UserMgr() {
        this.ak = '@!';                                         //账号
        this.pk = '&$';                                         //密码

        this.userInfo = '';                                     //用户数据
        this.avatar = '';                                       //头像地址
        this.nickname = '';                                     //名字
        this.account = '';                                      //账号
    };

    var _p = UserMgr.prototype;

    return UserMgr;
}());
module.exports = UserMgr;