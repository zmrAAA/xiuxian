cc.Class({
    extends: cc.Slider,

    properties: {
        max_Num: 10,                //最大值
        editBox_Num: cc.EditBox,    //显示框
        callback: [cc.Component.EventHandler]
    },

    start() {
        this.editBox_Num.placeholder = '';
        this.updateProgress();
    },

    updateProgress() {
        var num = parseInt(this.editBox_Num.string);
        if (isNaN(num)) {
            this.editBox_Num.string = '';
            return;  
        }
        var progress = num / this.max_Num;
        if (progress > 1) {
            progress = 1;
            num = this.max_Num;
        }
        this.progress = progress;
        this.editBox_Num.string = num;
        this.call();
    },

    updateEditBox() {
        var progress = this.progress;
        this.editBox_Num.string = parseInt(this.max_Num * progress);
        this.updateProgress();
        this.call();
    },

    /**监听触摸节点内松开
     *
     * @param e 触摸事件
     */
    call(e) {
        var callback = this.callback;
        var event;
        for (let i = 0, len = callback.length; i < len; i++) {
            event = this.analysisEventHandler(callback[i]);
            event.callback.call(event.target, callback[i].customEventData);
            event = null;
        }
        callback = null;
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

    setMax_Num(num) {
        this.max_Num = num;
        this.updateProgress();
    },

    getNum() {
        var num = parseInt(this.editBox_Num.string);
        return isNaN(num)?0:num;
    }
});
