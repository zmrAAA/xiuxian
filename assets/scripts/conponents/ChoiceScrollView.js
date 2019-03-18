/**选择器组件
 *
 */
cc.Class({
    extends: Script,

    properties: {
        isBank: false,          //是否是银行
        option: [cc.String],    //选项
        item: cc.Prefab,        //预制
        content: cc.Node,       //layout
        max_Height: 200,        //限制高
        view_Mask: cc.Node,     //遮罩
        btn_Open: cc.Node,      //开启选项
        currentOption: cc.Label,//显示选项的label
        _active_Potion: true,   //当前是否有打开选项框
        callback: [cc.Component.EventHandler]   //每次选择后的回调
    },

    /**程序入口
     *
     */
    start() {
        this.initPoint();
        this.updateCurrentOption(String(this.option[0]));
        Global.addClickEvent(this.btn_Open, this.node, 'ChoiceScrollView', 'active_Potion');
    },

    /**初始化
     *
     */
    initPoint() {
        var option = this.option,
            parent = this.content;
        for (let i = 0, len = option.length; i < len; i++) {
            var node = cc.instantiate(this.item);
            node.parent = parent;
            node.children[0].i18n_Label.string = this.getStr(option[i]);
            Global.addClickEvent(node, this.node, 'ChoiceScrollView', 'updateCurrentOption', option[i]);
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


    /**获取转换后的字符串
     *
     * @param str   需要转换的字符串
     */
    getStr(str) {
        str = Global.i18n.get(str);
        if (!this.isBank)
            return str;
        var regular = Global.gameConfig.bank.regular;
        str = str.replace('#0#', String(regular.interestRate_0 * 100) + '%');
        str = str.replace('#1#', String(regular.interestRate_1 * 100) + '%');
        str = str.replace('#3#', String(regular.interestRate_3 * 100) + '%');
        str = str.replace('#6#', String(regular.interestRate_6 * 100) + '%');
        return str;
    },

    /**开启或关闭选项
     *
     */
    active_Potion() {
        if (!this._active_Potion) {
            this.view_Mask.height = this.max_Height;
            this._active_Potion = true;
        } else {
            this.view_Mask.height = 0;
            this._active_Potion = false;
        }
    },

    /**更新当前选项
     *
     * @param key   key
     */
    updateCurrentOption(event, key) {
        if (!key)
            key = event;
        this.currentOption._key = key;
        this.currentOption.string = this.getStr(key);
        this.active_Potion();
        var callback = this.callback;
        var event;
        for (let i = 0, len = callback.length; i < len; i++) {
            event = this.analysisEventHandler(callback[i]);
            event.callback.call(event.target, callback[i].customEventData, key);
            event = null;
        }
    }

});
