module.exports = function (graph, settings) {
  var merge = require('ngraph.merge');
  settings = merge(settings, {
    physics: {
      springLength: 30,
      springCoeff: 0.0008,
      dragCoeff: 0.01,
      gravity: -1.2,
      theta: 1
    }
  });

  var layout = getDefaultLayout();
  var disposed = false;
  var sceneInitialized = false;

  return {
    run: animationLoop,

    renderOneFrame: renderOneFrame,

    dispose: function () {
      svgScene.dispose();
      layout.dispose();
      disposed = true;

      listenToGraphEvents(false);
    },

    nodeTemplate: function (template) {
    },

    linkTemplate: function (template) {
    },

    scene: svgScene
  };

  function animationLoop() {
    requestAnimationFrame(animationLoop);
    layout.step(); // TODO: this should stop, when layout is stable
    renderOneFrame();
  }

  function renderOneFrame() {
    if (disposed) return;
    if (!sceneInitialized) initializeScene();
  }

  function getDefaultLayout() {
    if (settings.layout) return settings.layout;
    var createLayout = require('ngraph.forcelayout');
    var physics = require('ngraph.physics.simulator');
    return createLayout(graph, physics(settings.physics));
  }

  function initializeScene() {
    sceneInitialized = true;

    graph.forEachNode(addNode);
    graph.forEachLink(addLink);

    listenToGraphEvents(true);
  }

  function addNode(node) {
  }

  function removeNode(node) {
  }

  function addLink(link) {
  }

  function removeLink(node) {

  }

  function listenToGraphEvents(isOn) {
    graph[isOn ? 'on': 'off']('changed', onGraphChanged);
  }

  function onGraphChanged(changes) {
    for (var i = 0; i < changes.length; ++i) {
      var change = changes[i];
      if (change.changeType === 'add') {
        if (change.node) {
          addNode(change.node);
        }
        if (change.link) {
          addLink(change.link);
        }
      } else if (change.changeType === 'remove') {
        if (change.node) {
          removeNode(change.node);
        }
        if (change.link) {
          removeLink(change.link);
        }
      }
    }
  }
};
