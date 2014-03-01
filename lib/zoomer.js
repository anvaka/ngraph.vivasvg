var vivasvg = require('vivasvg');
var zoomPan = require('./zoomPan');

module.exports = vivasvg.createTag('zoomer', {
  _appendToDom: function (parentDom) {
    var g = this.createElement('g');

    // TODO: this looks ugly, fix it (private variables with _)
    var svgRoot = this.getOwnerDocument()._dom;
    var transform = svgRoot.createSVGTransform();
    if (this._zero) {
      transform.setTranslate(this._zero.x, this._zero.y);
    }

    g.transform.baseVal.appendItem(transform);

    this._dom = g;
    parentDom.appendChild(this._dom);

    // todo: this should be invisble rect, not svgRoot. See more here:
    // http://stackoverflow.com/questions/16918194/d3-js-mouseover-event-not-working-properly-on-svg-group
    this._zoomPan = zoomPan(svgRoot, transform.matrix);
  },

  setZero: function (x, y) {
    this._zero = { x: x, y: y };
  }
});
