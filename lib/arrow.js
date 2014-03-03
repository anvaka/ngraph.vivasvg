var vivasvg = require('vivasvg');

vivasvg.createTag('arrow', {
  _appendToDom: function (parentDom) {
    this._dom = compileMarkup(this._markup, this._dataContext, this);
    parentDom.appendChild(this._dom);
  }
});

function compileMarkup(markup, model, arrow) {
  // todo: looks like some of the code below should belong to UIElement
  var path = arrow.createElement('path');
  var bindingParser = vivasvg.bindingParser(model);

  var strokeValue = markup.getAttributeNS(null, 'stroke');
  var sourceBinding = bindingParser.parse(strokeValue);
  if (sourceBinding) {
    path.setAttributeNS(null, 'stroke', sourceBinding.provide());
  } else if (strokeValue) {
    path.setAttributeNS(null, 'stroke', strokeValue);
  }

  var arrowId = addArrowTriangle(arrow, strokeValue);

  var from = bindingParser.parse(markup.getAttributeNS(null, 'from'));
  var to = bindingParser.parse(markup.getAttributeNS(null, 'to'));
  var fromSeg, toSeg;
  if (from && to) {
    var source = from.provide();
    var dest = to.provide();

    from.on('from', onPositionPropertyChanged);
    to.on('to', onPositionPropertyChanged);

    fromSeg = path.createSVGPathSegMovetoAbs(source.x, source.y);
    toSeg = path.createSVGPathSegLinetoAbs(dest.x, dest.y);
    path.pathSegList.appendItem(fromSeg);
    path.pathSegList.appendItem(toSeg);
  }

  path.setAttributeNS(null, 'marker-end', 'url(#' + arrowId + ')');

  var offsetValue = parseFloat(markup.getAttributeNS(null, 'offset')) || 0;
  return path;

  function onPositionPropertyChanged() {
    renderPath(from.provide(), to.provide());
  }

  function renderPath(source, dest) {
    var dx = 0, dy = 0;
    if (offsetValue) {
      dx = source.x - dest.x;
      dy = source.y - dest.y;
      var length = Math.sqrt(dx * dx + dy * dy);
      dx = offsetValue * dx/length; dy = offsetValue * dy / length;
    }

    fromSeg.x = source.x - dx;
    fromSeg.y = source.y - dy;
    toSeg.x = dest.x + dx;
    toSeg.y = dest.y + dy;
  }
}

function addArrowTriangle(arrow, color) {
  var ownerDocument = arrow.getOwnerDocument(arrow);
  var id = 'ArrowAugmented' + color;
  if (ownerDocument && !ownerDocument[id]) {
    ownerDocument.addDef('<marker id="' + id + '" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="strokeWidth" markerWidth="10" markerHeight="5" orient="auto" style="fill: ' + color + '"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>');
    ownerDocument[id] = true; // todo: should be better way
  }

  return id;
}
