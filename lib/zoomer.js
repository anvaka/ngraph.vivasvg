var vivasvg = require('vivasvg');
var zoomPan = require('./input/zoomPan');

module.exports = vivasvg.createTag('zoomer', {
  _appendToDom: function (parentDom) {
    var g = this.createElement('g');

    // TODO: this looks ugly, fix it (private variables with _)
    var svgRoot = this.getOwnerDocument()._dom;
    var transform = svgRoot.createSVGTransform();
    if (this._initialTransform) {
      transform.setTranslate(this._initialTransform.x, this._initialTransform.y);
      var scale = this._initialTransform.scale;
      transform.a = transform.d = scale;
    }

    g.transform.baseVal.appendItem(transform);

    this._dom = g;
    parentDom.appendChild(this._dom);

    // todo: this should be invisble rect, not svgRoot. See more here:
    // http://stackoverflow.com/questions/16918194/d3-js-mouseover-event-not-working-properly-on-svg-group
    this._zoomPan = zoomPan(svgRoot, transform.matrix);
  },

  moveTo: function (x, y) {
    if (this._zoomPan) {
      this._zoomPan.pan(x, y);
    } else if (this._initialTransform) {
      this._initialTransform.x = x;
      this._initialTransform.y = y;
    } else {
      this._initialTransform = { x: x, y: y, scale: 1 };
    }
  },

  scale: function (x, y, factor) {
    if (this._zoomPan) {
      this._zoomPan.zoom(x, y, factor);
    } else if (this._initialTransform) {
      this._initialTransform.x = x;
      this._initialTransform.y = y;
      this._initialTransform.scale = scale;
    } else {
      this._initialTransform = { x: x, y: y, scale: scale };
    }
  }
});
