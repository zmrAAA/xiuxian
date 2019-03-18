cc.Class({
    extends: Script,

    properties: {
        blackBg: cc.Node,           //加载背景
    },

    /**程序入口
     *
     */
    start() {
        cc.vv.game = this;
        this.newNode = {};
        this.prefab = {};
        // this.blackBg.zIndex = 2;
    },

    /**通过预制名字创建节点
     *
     * @param name          预制名字
     * @param isAnimation   是否播放动画
     * @param callback      回调函数
     */
    prefabNameToNode(name, isAnimation = true, callback) {
        var self = this;
        if (self.newNode[name])
            return;
        // self.blackBg.active = true;
        self.newNode[name] = true;
        cc.vv.Loader.generatePrefabNode(name, self.node, cc.p(), function (node, prefab) {
            self.newNode[name] = node;
            // self.blackBg.active = false;
            if (isAnimation) {
                node.opacity = 0;
                self.scheduleOnce(function () {
                    this.runAction(cc.fadeTo(0.5, 255));
                }.bind(node), 0);
            }
            self.prefab[name] = prefab;
            callback && callback(node);
        });
        cc.vv.EventTarget.emit('create_' + name);
    },

    /**移除所有界面
     *
     */
    removeAllPrefab() {
        var newNode = this.newNode;
        for (let i in newNode) {
            this.removePrefabByName(i);
        }
        cc.vv.EventTarget.emit('releaseAll');
    },

    /**通过名字移除预制相关资源
     *
     * @param name  预制的名字
     */
    removePrefabByName(name) {
        var self = this;
        if (!self.newNode[name] || !(self.newNode[name] instanceof cc.Node))
            return;
        self.newNode[name].emit('release');
        cc.vv.Loader.release(self.prefab[name], true);
        self.prefab[name] = null;
        self.destroyNode(name);
        cc.vv.EventTarget.emit('remove_' + name);
    },

    /**通过名字销毁节点
     *
     * @param name  节点在当前对象里面的key
     */
    destroyNode(name) {
        if (!this.newNode[name])
            return;
        this.newNode[name].destroy();
        this.newNode[name] = null;
    }
});
