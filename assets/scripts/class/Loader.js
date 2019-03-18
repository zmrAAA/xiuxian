/**加载类
 *
 */
'use strict';
/**加载clip回调
 *
 * @param clip      动画
 */
function animationCallBack(clip) {
    if (!this.isValid)
        return;
    var com = this.Animation;
    if (!com)
        com = this.addComponent(cc.Animation);
    com.addClip(clip, clip.$$newName);
    com.play(clip.$$newName);
    // if (this.time) {
    //     com.on('finished ', function () {
    //         this.scheduleOnce(function () {
    //             this.play(clip.$$newName);
    //         }, this.node.time);
    //     }, com);
    // }
};

/**加载resources外的资源
 *
 * @param path      路径
 * @param callback  回调
 */
function load(path, callback) {
    if (!path)
        throw `加载resources外的资源没有传入路径`;
    cc.loader.load(path, function (err, assets) {
        if (err)
            throw `加载resources外的资源错误${err}`;
        callback && callback(assets);
    });
};

/**加载resources内的资源
 *
 * @param path      路径
 * @param type      类型
 * @param callback  回调
 */
function loadRes(path, type, callback) {
    if (!path)
        throw `加载resources内的资源没有传入路径`;
    cc.loader.loadRes(path, type, function (err, assets) {
        if (err)
            throw `加载resources内的资源错误${err}`;
        callback && callback(assets);
    });
};

/**获取相关资源
 *
 * @param assets    资源
 */
function getDependsRecursively(assets) {
    return cc.loader.getDependsRecursively(assets);
};

/**获取资源的路径
 *
 * @param assets    资源
 */
function getReferenceKey(assets) {
    return cc.loader._getReferenceKey(assets);
};

/**释放资源
 *
 * @param assets    需要释放的资源或路径
 */
function release(assets) {
    if (!assets)
        throw `没有选择释放的资源`;
    cc.loader.release(assets);
};

/**获取路径
 *
 * @param path  resources文件夹下的路径
 */
function raw(path) {
    return cc.url.raw('resources/' + path);
};

const Loader = (function () {

    function Loader() {
        this.animationClip = {};                //存储动画
        this._loadingUrl = {};                  //正在加载的资源
        this._loadItems = {};                   //加载的资源
    };

    var _p = Loader.prototype;

    /**初始化
     *
     */
    _p.init = function () {
        cc.vv.Observer.on('releaseAll', this.onReleaseAll, this);
    };

    /**监听重新登入
     *
     */
    _p.onReleaseAll = function () {
        this._loadItems = null;
        this._loadItems = {};
    };

    /**加载资源
     *
     * @param path      资源路径
     * @param type      类型
     * @param callback  回调
     */
    _p.load = function (path, type, callback) {
        if (this._loadingUrl[path])
            return callback && this._loadingUrl[path].push(callback);

        this._loadingUrl[path] = callback ? [callback] : [];

        loadRes(path, type, function (assets) {
            this.addAssets(assets);

            var loadingUrl = this._loadingUrl[path],
                len = loadingUrl.length,
                i = 0;
            for (; i < len; i++)
                loadingUrl[i](assets);

            delete this._loadingUrl[path];
        }.bind(this));
    };

    /**添加资源引用
     *
     * @param assets    需要添加的资源或路径
     */
    _p.addAssets = function (assets) {
        var deps = getDependsRecursively(assets),
            loadItems = this._loadItems,
            i = deps.length - 1;
        for (; i >= 0; i--) {
            if (loadItems[deps[i]])
                loadItems[deps[i]]++;
            else
                loadItems[deps[i]] = 1;
        }
    };

    /**移除资源
     *
     * @param assets            需要移除的资源或路径
     * @param isReleaseRelevant 是否需要释放相关的资源
     */
    _p.release = function (assets, isReleaseRelevant) {
        var deps = !isReleaseRelevant ? [getReferenceKey(assets)] : getDependsRecursively(assets),
            i = deps.length - 1;
        for (; i >= 0; i--) {
            this.removeAssets(deps[i]);
        }
    };

    /**移除资源引用
     *
     * @param assets    需要移除的资源或路径
     */
    _p.removeAssets = function (assets) {
        if (typeof assets !== 'string')
            assets = getReferenceKey(assets);

        var loadItems = this._loadItems;
        if (loadItems[assets]) {
            loadItems[assets]--;
            if (loadItems[assets] <= 0) {
                release(assets);
                delete loadItems[assets];
            }
        } else {
            release(assets);
        }
    };

    /**更换精灵帧
     *
     * @param path      资源路径
     * @param node      需要替换的节点
     * @param callback  回调
     */
    _p.changeSpriteFrame = function (path, node, callback) {
        if (!node)
            throw `没有传入节点`;
        this.loadSpriteFrame(path, function (texture, spriteFrame) {
            if (!node.isValid)
                return;
            spriteFrame._uuid = texture._uuid;
            var component = node.Sprite || node.Mask;
            if (!component) {
                if (node instanceof cc.Sprite || node instanceof cc.Mask)
                    component = node;
                else
                    throw `更换精灵帧的时候节点没有精灵或者遮罩组件`;
            }
            component.spriteFrame = spriteFrame;
            callback && callback(texture, spriteFrame);
        });
    };

    /**直接生成一个预制节点
     *
     * @param path      预制路径
     * @param parent    父节点
     * @param pos       位置
     * @param callback  回调
     * @param isRelease 加载完是否需要释放预制
     */
    _p.generatePrefabNode = function (path, parent, pos, callback, isRelease) {
        this.loadPrefab(path, function (prefab) {
            var node = cc.instantiate(prefab);
            node.parent = parent || null;
            node.setPosition(pos || cc.p(0, 0));
            callback && callback(node, prefab);
        }.bind(this), isRelease);
    };

    /**加载预制
     *
     * @param path      路径
     * @param callback  回调
     * @param isRelease 加载完是否需要释放预制
     */
    _p.loadPrefab = function (path, callback, isRelease) {
        this.load('prefab/' + path, cc.Prefab, function (prefab) {
            callback && callback(prefab);
            isRelease && this.release(prefab, false);
        }.bind(this));
    };

    /**加载图片
     *
     * @param path      路径
     * @param callback  回调
     * @param param     回调的时候附带的参数
     */
    _p.loadSpriteFrame = function (path, callback, param) {
        this.load('texture/' + path, cc.Texture2D, function (texture) {
            callback && callback(texture, new cc.SpriteFrame(texture), param);
        }.bind(this));
    };

    /**加载图集
     *
     * @param path      路径
     * @param callback  回调
     * @param param     回调的时候附带的参数
     */
    _p.loadSpriteAtlas = function (path, callback, param) {
        this.load('plist/' + path, cc.SpriteAtlas, function (spriteAtlas) {
            callback && callback(spriteAtlas, param);
        }.bind(this));
    };

    /**加载图集并转化为帧动画
     *
     * @param path      路径
     * @param callback  回调
     * @param sample    帧速率,没有则默认10
     */
    _p.loadSpriteAtlasToClip = function (path, callback, sample = 10) {
        this.loadSpriteAtlas(path, function (spriteAtlas) {
            var clip = cc.AnimationClip.createWithSpriteFrames(spriteAtlas.getSpriteFrames(), sample);
            callback && callback(clip, spriteAtlas);
        });
    };

    /**加载图集转为动画并播放
     *
     * @param node      需要播放的节点
     * @param newName   动画的名字
     * @param path      路径
     * @param callback  回调
     * @param wapMode   播放模式,默认循环
     * @param sample    帧速率,没有则默认10
     */
    _p.loadSpriteAtlasToClipAndPlay = function (node, newName = 'default', path, callback, wapMode = cc.WrapMode.Loop, sample) {
        if (!node)
            throw '加载图集转为动画并播放没有节点';
        var name = path + '_' + newName;
        if (this.animationClip[name] === true)
            return cc.vv.Observer.once(name, animationCallBack, node);
        else if (this.animationClip[name] instanceof cc.AnimationClip)
            return animationCallBack.call(node, this.animationClip[name]);
        this.animationClip[name] = true;
        this.loadSpriteAtlasToClip(path, function (clip, spriteAtlas) {
            clip.wrapMode = wapMode;
            clip.$$newName = newName;
            animationCallBack.call(node, clip);
            cc.vv.Observer.emit(name, clip);
            this.animationClip[name] = clip;
        }.bind(this), sample);
    };

    /**加载音乐
     *
     * @param path      路径
     * @param callback  回调
     */
    _p.loadMusic = function (path, callback) {
        this.load('music/' + path, cc.AudioClip, function (audioClip) {
            callback && callback(audioClip);
        }.bind(this));
    };

    /**加载json
     *
     * @param path      路径
     * @param callback  回调
     */
    _p.loadJson = function (path, callback) {
        this.load(path, cc.JsonAsset, function (json) {
            callback && callback(json);
        }.bind(this));
    };

    /**加载字体
     *
     * @param path      路径
     * @param tOrB      类型
     * @param callback  回调
     */
    _p.loadFont = function (path, tOrB, callback) {
        this.load('font/' + path, tOrB === 't' ? cc.TTFFont : cc.BitmapFont, function (font) {
            callback && callback(font);
        }.bind(this));
    };

    /**替换label字体
     *
     * @param node      替换的节点
     * @param path      路径
     * @param tOrB      类型
     * @param callback  回调
     */
    _p.changeFont = function (node, path, tOrB, callback) {
        this.loadFont(path, tOrB, function (font) {
            var com = node.i18n_Label;
            if (!com)
                throw `替换字体的节点没有label组件`;
            com.font = font;
            callback && callback(font);
        }.bind(this));
    };

    return Loader;
}());
module.exports = Loader;
