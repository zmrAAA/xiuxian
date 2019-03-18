/**滑动组件
 *
 */
cc.Class({
    extends: Script,

    properties: {
        prefabItem: cc.Prefab,                  //预制
        content: cc.Node,                       //layout
        count: 3,                               //一排要几个
    },

    onLoad() {
        var data = this.prefabItem.data,
            layout = this.content.Layout,
            left = layout.paddingLeft,
            right = layout.paddingRight,
            cWidth = this.content.width - left - right,
            width = data.width,
            count = this.count;
        layout.spacingX = (cWidth - width * count) / (count - 1);
        this.Pool = new cc.NodePool();
        for (let i = 0; i < 10; i++)
            this.Pool.put(cc.instantiate(this.prefabItem));
    },

    /**添加预制
     *
     * @param data  数据
     */
    addItem(data) {
        var item;
        if (this.Pool.size() > 0)
            item = this.Pool.get();
        else
            item = cc.instantiate(this.prefabItem);
        item.parent = this.content;
        item.Script.init(data);
    },

    /**添加预制
     *
     * @param data          数据
     */
    addItem_2(data) {
        var item;
        if (this.Pool.size() > 0)
            item = this.Pool.get();
        else
            item = cc.instantiate(this.prefabItem);
        item.parent = this.content;
        item.Script.init(data.amount, data.expire_time, data.remark, data.id, data.expect_profit);
    },

    /**清除现在的列表
     *
     */
    removeAll() {
        this.content.removeAllChildren(true);
    }

});
