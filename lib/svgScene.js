module.exports = function (container, layout) {
  container = container || document.body;
  var svgns = "http://www.w3.org/2000/svg";
  var svgRoot = document.createElementNS(svgns, "svg");
  container.appendChild(svgRoot);
  var elements = [];
  var layers = {};

  return {
    dispose: function () {
    },

    addElement: function (el) {
      var pos = layout.getNodePosition(el.model.id);
      Object.keys(el.layers).forEach(function (key) {
        var transform = svgRoot.createSVGTransform();
        var element = el.layers[key];
        elements.push({
          element: element,
          pos: pos,
          transform: transform
        });

        element.transform.baseVal.appendItem(transform);
        appendToLayer(key, element);
      });
    },

    setLayersOrder: function (layerNames) {
    },

    render: render
  };

  function appendToLayer(layerName, element) {
    var layer = layers[layerName];
    if (!layer) {
      layer = layers[layerName] = document.createElementNS(svgns, 'g');
      svgRoot.appendChild(layer);
    }

    layer.appendChild(element);
  }


  function render() {
    elements.forEach(renderElement);
  }

  function renderElement(el) {
    el.transform.setTranslate(el.pos.x, el.pos.y);
  }
};
