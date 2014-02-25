module.exports = function (container) {
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
      el.append(sceneRoot);
      elements.push(el);
    },

    setLayersOrder: function (layerNames) {
    },

    render: render,
    root: svgRoot
  };

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
    el.render();
    //el.transform.setTranslate(el.pos.x, el.pos.y);
  }
};
