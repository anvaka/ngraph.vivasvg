module.exports = NodeUI;

function NodeUI(svgMarkup, transform, pos) {
  this.markup = svgMarkup;
  this.transform = transform;
  this.pos = pos;
  svgMarkup.transform.baseVal.appendItem(transform);
}

NodeUI.prototype.append = function (root) {
  root.appendChild(this.markup);
};

NodeUI.prototype.render = function () {
  var pos = this.pos;
  this.transform.setTranslate(pos.x, pos.y);
};
