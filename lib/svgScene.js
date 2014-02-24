module.exports = function (container, layout) {
  container = container || document.body;
  var svgns = "http://www.w3.org/2000/svg";
  var svgRoot = document.createElementNS(svgns, "svg");
  var sceneRoot;
  initSceneRoot();

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
      sceneRoot.appendChild(layer);
    }

    layer.appendChild(element);
  }

  function initSceneRoot() {
    sceneRoot = document.createElementNS(svgns, 'g');

    var transform = svgRoot.createSVGTransform();
    transform.setTranslate(container.clientWidth/2, container.clientHeight/2);
    sceneRoot.transform.baseVal.appendItem(transform);
    svgRoot.appendChild(sceneRoot);
  }

  function render() {
    elements.forEach(renderElement);
  }

  function renderElement(el) {
    el.transform.setTranslate(el.pos.x, el.pos.y);
  }
};
