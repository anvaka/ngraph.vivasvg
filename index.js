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
  var svgScene = require('./lib/svgScene')(settings.container, layout);
  var disposed = false;
  var sceneInitialized = false;
  var svgCompiler = require('./lib/svgCompiler');
  var extensions = {
    arrow: require('./lib/arrow')
  };

  var createNodeUI, createLinkUI;

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
      var createMarkup = svgCompiler(template);
      var NodeUI = require('./lib/nodeUI');

      createNodeUI = function (node) {
        var markup = createMarkup(node);
        var transform = svgScene.root.createSVGTransform();
        var pos = layout.getNodePosition(node.id);
        return new NodeUI(markup, transform, pos);
      };
    },

    linkTemplate: function (template) {
      createLinkUI = svgCompiler(template, extensions);
    },

    scene: svgScene
  };

  function animationLoop() {
    if (disposed) return;
    if (!sceneInitialized) initializeScene();

    requestAnimationFrame(animationLoop);
    layout.step(); // TODO: this should stop, when layout is stable
    renderOneFrame();
  }

  function renderOneFrame() {
    svgScene.render();
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
    var ui = createNodeUI(node);
    svgScene.addElement(ui);
  }

  function removeNode(node) {
  }

  function addLink(link) {
    var ui = createLinkUI(link);
    var linkPosition = layout.getLinkPosition(link.id);
    svgScene.addElement({
      render: function () {
        for (var i = 0; i < ui.controls.length; ++i) {
          ui.controls[i].render(linkPosition);
        }
      },
      append: function (root) {
        root.appendChild(ui.element);
      }
    });
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
