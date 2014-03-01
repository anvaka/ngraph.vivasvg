module.exports = zoomPan;

var domEvents = require('./domEvents');

function zoomPan(domRoot, matrix) {
  var input = domEvents(domRoot);
  var isDragging = false;
  var prevX;
  var prevY;

  input.on('wheel', onWheel);
  input.on('mousemove', onMouseMove);
  input.on('mousedown', onMouseDown);
  input.on('mouseup', onMouseUp);

  function onWheel(e) {
    var isZoomIn = e.deltaY < 0;
    var direction = isZoomIn ? 1 : -1;
    var factor = (1 + direction * 0.1);
    zoom(e.clientX, e.clientY, factor);
  }

  function onMouseDown(e) {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  }

  function onMouseMove(e) {
    if (!isDragging) return;

    var offsetX = (e.clientX - prevX);
    var offsetY = (e.clientY - prevY);
    moveTo(matrix.e + offsetX, matrix.f + offsetY);
    prevX = e.clientX;
    prevY = e.clientY;
    e.preventDefault();
  }

  function onMouseUp(e) {
    isDragging = false;
  }

  function zoom(x, y, factor) {
    matrix.e = x - factor * (x - matrix.e);
    matrix.f = y - factor * (y - matrix.f);
    var scale = matrix.a * factor;
    matrix.a = matrix.d = scale;
  }

  function moveTo(x, y) {
    matrix.e = x;
    matrix.f = y;
  }

  return {
    dispose: function () {
      input.dispose();
    }
  };
}
