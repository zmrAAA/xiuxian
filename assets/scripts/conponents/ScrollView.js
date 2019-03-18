/**滑动组件
 *
 */
cc.Class({
    extends: cc.ScrollView,

    properties: {
        prefabItem: cc.Prefab,              //预制
        spawnCount: 0,                      //生成的预制数量
        totalCount: 0,                      //总项目数
        spacing: 0,                         //每个项目的间隔
        bufferZone: 0,                      //缓冲区
        updateInterval: 0                   //刷新频率
    },

    onLoad() {
        this.Pool = new cc.NodePool();
        for (let i = 0; i < this.spawnCount; i++)
            this.Pool.put(cc.instantiate(this.prefabItem));
    },

    /**初始化
     *
     * @param prefabItem                    //预制
     * @param spawnCount                    //生成的预制数量
     * @param totalCount                    //总项目数
     * @param spacing                       //每个项目的间隔
     * @param bufferZone                    //缓冲区
     * @param updateInterval                //刷新频率
     */
    init(prefabItem, spawnCount, totalCount, spacing, bufferZone, updateInterval) {
        this.updateTimer = 0;
        this.prefabItem = prefabItem || this.prefabItem;
        this.spawnCount = spawnCount || this.spawnCount;
        this.totalCount = totalCount || this.totalCount;
        this.bufferZone = bufferZone || this.bufferZone;
        this.updateInterval = updateInterval || this.updateInterval;
    },

    /**生成项目
     *
     * @param data          数据
     * @param totalCount    一共有几个
     * @param type          类型
     */
    initialize(data, totalCount, type) {
        this.putAll();
        this.type = type;
        this.record = data;
        totalCount = this.totalCount = totalCount || data.length;
        this.items = [];                                                    //存储项目
        this.content.height = this.totalCount * (this.prefabItem.data.height + this.spacing) + this.spacing;
        var len = totalCount < this.spawnCount ? totalCount : this.spawnCount;
        len = len > data.length ? data.length : len;
        for (let i = 0; i < len; ++i) {
            let item = this.createItem(i, this.content);
            item.setPosition(0, -item.height * (0.5 + i) - this.spacing * (i + 1));
            this.items.push(item);
        }
    },

    /**清除所有项目
     *
     */
    putAll() {
        if (!this.items)
            return;
        var items = this.items;
        for (let i = 0, len = items.length; i < len; i++) {
            this.Pool.put(items[i]);
        }
        this.items = null;
        items = null;
    },

    /**创建项目
     *
     * @param index     索引
     * @param parent    父节点
     */
    createItem(index, parent) {
        let item;
        if (this.Pool.size() > 0)
            item = this.Pool.get();
        else
            item = cc.instantiate(this.prefabItem);
        item.parent = parent;
        item.Script.init(index + 1, this.record[index], this.type);
        return item;
    },

    /**获取项目当前位置
     *
     * @param item  项目
     */
    getPositionInView(item) {
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    /**更新滑动节点显示
     *
     */
    update(dt) {
        if (this._autoScrolling) {
            this._processAutoScrolling(dt);
        }
        if (!this.items || this.items.length === 0)
            return;
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval)
            return;
        this.updateTimer = 0;
        let items = this.items;
        let buffer = this.bufferZone;
        let isDown = this.content.y < this.lastContentPosY;
        let offset = (this.prefabItem.data.height + this.spacing) * items.length;
        let item, itemId;
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            if (isDown) {
                if (viewPos.y < -buffer && items[i].y + offset < 0) {
                    items[i].setPositionY(items[i].y + offset);
                    item = items[i].Script;
                    itemId = item.itemID - items.length;
                    if (this.record[itemId - 1])
                        item.init(itemId, this.record[itemId - 1], this.type);
                }
            } else {
                if (viewPos.y > buffer && items[i].y - offset > -this.content.height) {
                    items[i].setPositionY(items[i].y - offset);
                    item = items[i].Script;
                    itemId = item.itemID + items.length;
                    if (this.record[itemId - 1])
                        item.init(itemId, this.record[itemId - 1], this.type);
                }
            }
            item = null;
        }
        this.lastContentPosY = this.content.y;
    }
});
