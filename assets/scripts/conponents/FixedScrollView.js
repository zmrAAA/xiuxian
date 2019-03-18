/**滑动组件
 *
 */
cc.Class({
    extends: Script,

    properties: {
        layout: cc.Node,        //布局节点
        spacing: 0,             //每个项目的间隔
        centeredNode: cc.Node,  //初始化要居中的节点
        centeredPosX: 0,        //居中到哪，基于当前脚本节点
        isScale: true,          //是否缩放
    },

    onLoad() {
        this.touchEnd = true;

        this.lastContentPosX = this.layout.x;                                                   //备份坐标，用于判断往左或往右
        this.centeredNode.viewPos = {x: 100};                                                   //自定义视图坐标
        this.centeredNode.absX = 0;

        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);                     //注册触摸移动
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);                       //注册触摸节点内结束
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);                 //注册触摸节点外结束

        this.layout.on('position-changed', this.updateItem, this);                              //监听移动

        this.updateItem();
    },

    /**显示下一个
     *
     */
    next() {
        if (!this.touchEnd)
            return;
        this.layout.runAction(cc.moveBy(0.5, -this.layout.parent.width, 0));
    },

    /**添加新项
     *
     * @param node  需要添加的节点
     */
    addItem(node) {
        var len = this.layout.children.length;
        if (len) {
            node.setPositionX(this.layout.children[len - 1].x + node.width);
        } else {
            node.setPositionX(node.width >> 1);
        }
        node.parent = this.layout;
    },

    /**监听触摸移动
     *
     * @param e 触摸事件
     */
    onTouchMove(e) {
        this.touchEnd = false;

        this.layout.x += e.touch.getDelta().x;                                                  //移动
        this.lastContentPosX = this.layout.x;
    },

    /**监听触摸节点内结束
     *
     */
    onTouchEnd() {
        this.touchEnd = true;

        var viewPosX = this.centeredNode.viewPos.x,
            absX = this.centeredNode.absX;

        this.layout.runAction(cc.moveBy(0.1, viewPosX > 0 ? -absX : absX, 0));       //滚到中间
    },

    /**监听触摸节点外结束
     *
     */
    onTouchCancel() {
        this.onTouchEnd();
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

    /**更新滚动视图
     *
     */
    updateItem() {
        var items = this.layout.children;                                       //所有子节点

        if (!items.length)
            return;

        var buffer = (this.node.width >> 1) + (items[0].width >> 1);            //缓冲区（低于这个值就切换坐标）
        var isLeft = this.layout.x < this.lastContentPosX;                      //判断方向
        var offset = (items[0].width + this.spacing) * items.length;            //偏移坐标
        var centeredNodeX = buffer;                                             //当前需要居中节点的视图坐标
        var isScale = this.isScale,
            viewPos,            // 视图坐标
            absX,               // 视图坐标的X绝对值
            scaleX;             //缩放

        for (var i = 0; i < items.length; ++i) {
            viewPos = this.getPositionInView(items[i]);                     //获取视图坐标
            absX = Math.abs(viewPos.x - this.centeredPosX);                 //获取绝对值
            if (absX < centeredNodeX) {                                     //需要更换居中节点
                this.centeredNode = items[i];
                this.centeredNode.viewPos = viewPos;
                this.centeredNode.absX = absX;
                centeredNodeX = absX;
            }
            if (isScale) {
                scaleX = (buffer - absX) / buffer;
                items[i].scale = scaleX < 0 ? 0 : scaleX;
            }

            //改变坐标
            if (isLeft) {
                if (viewPos.x < -buffer) {
                    items[i].setPositionX(items[i].x + offset);
                }
            } else {
                if (viewPos.x > buffer) {
                    items[i].setPositionX(items[i].x - offset);
                }
            }
        }
    }
});
