module.exports = NodeUI;

function NodeUI(svgMarkup, transform, pos) {
  this.markup = svgMarkup;
  this.transform = transform;
  this.pos = pos;
  this.customControls = svgMarkup.controls;
  svgMarkup.element.transform.baseVal.appendItem(transform);
}

NodeUI.prototype.append = function (root) {
  root.appendChild(this.markup.element);
};

NodeUI.prototype.render = function () {
  var pos = this.pos;
  this.transform.setTranslate(pos.x, pos.y);
  if (this.customControls) {
    this.customControls.forEach(renderControl);
  }
};

function renderControl(ctrl) {
  ctrl.render();
}
