module.exports = Arrow;

function Arrow(proto, bindingReplacement) {
  var from = proto.getAttributeNS(null, 'from');
  var to = proto.getAttributeNS(null, 'to');

  this.fromName = from.replace(/{{(.+?)}}/g, bindingReplacement);
  this.toName = to.replace(/{{(.+?)}}/g, bindingReplacement);
  this.from = this.to = null;

  this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  this.path.setAttributeNS(null, 'stroke', 'gray');
}

Arrow.prototype.appendTo = function (root) {
  root.appendChild(this.path);
};

Arrow.prototype.render = function (linkPosition) {
  if (!this.from) {
    this.from = document.getElementById(this.fromName);
  }
  if (!this.to) {
    this.to = document.getElementById(this.toName);
  }

  if (!this.from || !this.to) return;
  this.path.setAttributeNS(null, 'd', "M" + linkPosition.from.x + ',' + linkPosition.from.y + 'L' +
    linkPosition.to.x + ',' +  linkPosition.to.y);
};
