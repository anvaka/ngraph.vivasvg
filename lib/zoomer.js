var vivasvg = require('vivasvg');

module.exports = vivasvg.createTag('zoomer', {

  _appendToDom: function (parentDom) {
    var g = this.createElement('g');

    // TODO: this looks ugly, fix it.
    var svgRoot = this.getOwnerDocument()._dom;
    var transform = svgRoot.createSVGTransform();
    if (this._zero) {
      transform.setTranslate(this._zero.x, this._zero.y);
    }

    this._transform = transform;
    g.transform.baseVal.appendItem(transform);

    this._dom = g;
    parentDom.appendChild(this._dom);
  },

  setZero: function (x, y) {
    this._zero = { x: x, y: y };
  }
});
