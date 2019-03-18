cc.Class({
    extends: Script,

    init: function (data) {
        var qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
        qrcode.addData(data);
        qrcode.make();

        var ctx = this.node.Graphics || this.node.addComponent(cc.Graphics);
        ctx.fillColor = cc.Color.BLACK;
        var moduleCount = qrcode.getModuleCount(),
            tileW = this.node.width / moduleCount,
            tileH = this.node.height / moduleCount;
        var w, h;
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                if (qrcode.isDark(row, col)) {
                    w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                    h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                    ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                }
            }
        }
        ctx.fill();
    }
});