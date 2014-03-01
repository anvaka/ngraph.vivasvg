module.exports = function (graph, settings) {
  var merge = require('ngraph.merge');
  var vivasvg = require('vivasvg');

  settings = merge(settings, {
    physics: {
      springLength: 30,
      springCoeff: 0.0008,
      dragCoeff: 0.01,
      gravity: -1.2,
      theta: 1
    }
  });

  // todo: abstract this as scene
  var svgDoc = new vivasvg.Document(settings.container || document.body);
  var nodes = new vivasvg.Collection();
  var edges = new vivasvg.Collection();

  var layout = getDefaultLayout();
  var disposed = false;
  var sceneInitialized = false;
  var _nodeTemplate, _linkTemplate;

  return {
    run: animationLoop,

    renderOneFrame: renderOneFrame,

    dispose: function () {
      layout.dispose();
      disposed = true;

      listenToGraphEvents(false);
    },

    nodeTemplate: function (template) {
      _nodeTemplate = template;
    },

    linkTemplate: function (template) {
      _linkTemplate = template;
    }
  };

  function animationLoop() {
    requestAnimationFrame(animationLoop);
    layout.step(); // TODO: this should stop, when layout is stable
    renderOneFrame();
  }

  function renderOneFrame() {
    if (disposed) return;
    if (!sceneInitialized) initializeScene();
    nodes.forEach(notifyNodePositionChange);
  }

  function notifyNodePositionChange(node) {
    node.fire('pos');
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

    var edgesUI = new vivasvg.ItemsControl();
    edgesUI.setItemTemplate(_linkTemplate);
    edgesUI.setItemSource(edges);
    svgDoc.appendChild(edgesUI);

    var nodesUI = new vivasvg.ItemsControl();
    nodesUI.setItemTemplate('<g transform="translate({{pos.x}}, {{pos.y}})">' + _nodeTemplate + '</g>');
    nodesUI.setItemSource(nodes);
    svgDoc.appendChild(nodesUI);

    listenToGraphEvents(true);
  }

  function addNode(node) {
    nodes.push(vivasvg.model({
      pos: layout.getNodePosition(node.id),
      id: node.id,
      node: node
    }));
  }

  function removeNode(node) {
  }

  function addLink(link) {
    edges.push(link);
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