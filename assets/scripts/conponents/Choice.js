var option = cc.Class({
    name: 'option',
    properties: {
        spriteFrame: cc.SpriteFrame,
        callback: [cc.Component.EventHandler]
    }
});
cc.Class({
    extends: Script,

    properties: {
        option: [option],
        index: 0,
    },

    onLoad() {
        this.Sprite = this.node.Sprite;
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    },

    /**监听触摸节点内松开
     *
     * @param e 触摸事件
     */
    onTouchEnd(e) {
        this.index++;
        if (this.index >= this.option.length)
            this.index = 0;
        this.Sprite.spriteFrame = this.option[this.index].spriteFrame;
        var callback = this.option[this.index].callback;
        var event;
        for (let i = 0, len = callback.length; i < len; i++) {
            event = this.analysisEventHandler(callback[i]);
            event.callback.call(event.target, callback[i].customEventData);
            event = null;
        }
    },

    /**解析回调信息
     *
     */
    analysisEventHandler(eventHandler) {
        var target = eventHandler.target.getComponent(eventHandler.component);
        return {
            target: target,
            callback: target[eventHandler.handler],
        };
    },

    /**监听触摸节点外松开
     *
     * @param e 触摸事件
     */
    onTouchCancel(e) {
        this.onTouchEnd(e);
    },

});
