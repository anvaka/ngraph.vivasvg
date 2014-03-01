var vivasvg = require('vivasvg');

vivasvg.createTag('arrow', {
  _appendToDom: function (parentDom) {
    this._dom = compileMarkup(this._markup, this._dataContext, this);
    parentDom.appendChild(this._dom);
  }
});

function compileMarkup(markup, model, arrow) {
  // todo: looks like some of the code below should belong to UIElement
  addArrowTriangle(arrow);

  var path = arrow.createElement('path');
  var bindingParser = vivasvg.bindingParser(model);

  var strokeValue = markup.getAttributeNS(null, 'stroke');
  var sourceBinding = bindingParser.parse(strokeValue);
  if (sourceBinding) {
    path.setAttributeNS(null, 'stroke', sourceBinding.provide());
  } else if (strokeValue) {
    path.setAttributeNS(null, 'stroke', strokeValue);
  }

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

  path.setAttributeNS(null, 'marker-end', 'url(#ArrowTriangle)');

  return path;

  function onPositionPropertyChanged() {
    renderPath(from.provide(), to.provide());
  }

  function renderPath(source, dest) {
    fromSeg.x = source.x;
    fromSeg.y = source.y;
    toSeg.x = dest.x;
    toSeg.y = dest.y;
  }
}

function addArrowTriangle(arrow) {
  var ownerDocument = arrow.getOwnerDocument(arrow);
  if (ownerDocument && !ownerDocument.ArrowAugmented) {
    ownerDocument.addDef('<marker id="ArrowTriangle" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="strokeWidth" markerWidth="10" markerHeight="5" orient="auto" style="fill: deepskyblue"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>');
    ownerDocument.ArrowAugmented = true; // todo: should be better way
  }
}
