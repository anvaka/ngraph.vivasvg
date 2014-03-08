require('./lib/arrow');
var merge = require('ngraph.merge');
var vivasvg = require('vivasvg');

module.exports = function (graph, settings) {
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
  var container = settings.container || document.body;
  var svgDoc = new vivasvg.Document(container);
  var zoomer;
  var nodes = vivasvg.collection();
  var edges = vivasvg.collection();

  var layout = getDefaultLayout();
  var isStable = false;
  var disposed = false;
  var sceneInitialized = false;
  var _nodeTemplate, _linkTemplate;
  var draggingNode, dragNodeDx, dragNodeDy;

  var api = {
    run: animationLoop,
    renderOneFrame: renderOneFrame,
    layout: layout,

    dispose: function () {
      layout.dispose();
      svgDoc.dispose();
      api.off();
      disposed = true;

      listenToGraphEvents(false);
      listenToDomEvents(false);
    },

    nodeTemplate: function (template) {
      _nodeTemplate = template;
    },

    linkTemplate: function (template) {
      _linkTemplate = template;
    }
  };

  require('ngraph.events')(api);

  return api;

  function animationLoop() {
    if (disposed) return;
    requestAnimationFrame(animationLoop);
    if (!isStable) {
      nowStable = layout.step();
      renderOneFrame();
    }
  }

  function renderOneFrame() {
    if (disposed) return;
    if (!sceneInitialized) initializeScene();
    nodes.forEach(notifyNodePositionChange);
    edges.forEach(notifyEdgePositionChange);
  }

  function notifyNodePositionChange(node) {
    node.fire('pos');
  }

  function notifyEdgePositionChange(edge) {
    edge.fire('from');
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
    var Zoomer = require('./lib/zoomer');
    zoomer = new Zoomer();
    zoomer.moveTo(container.clientWidth/2, container.clientHeight/2);
    svgDoc.appendChild(zoomer);

    var edgesUI = new vivasvg.ItemsControl();
    edgesUI.setItemTemplate(_linkTemplate);
    edgesUI.setItemSource(edges);
    zoomer.appendChild(edgesUI);

    var nodesUI = new vivasvg.ItemsControl();
    nodesUI.setItemTemplate('<g transform="translate({{pos.x}}, {{pos.y}})" onmousedown="{{mousedown}}">' + _nodeTemplate + '</g>');
    nodesUI.setItemSource(nodes);
    zoomer.appendChild(nodesUI);

    listenToGraphEvents(true);
    listenToDomEvents(true);
  }

  function addNode(node) {
    nodes.push(vivasvg.model({
      pos: layout.getNodePosition(node.id),
      id: node.id,
      node: node,
      mousedown: onMouseDownNode,
    }));
  }

  function onMouseUp(e) {
    if (draggingNode) {
      var node = draggingNode.node;
      layout.pinNode(node, draggingNode.wasPinned);
    }
    draggingNode = null;
  }

  function onMouseDownNode(e, model) {
    draggingNode = model;

    draggingNode.wasPinned = layout.isNodePinned(model.node);
    layout.pinNode(model.node, true);
    var pos = zoomer.getModelPosition(e.clientX, e.clientY);
    dragNodeDx = pos.x - model.pos.x;
    dragNodeDy = pos.y - model.pos.y;
    e.stopPropagation();
    api.fire('nodeSelected', model.node);
  }

  function onMouseMove(e) {
    if (!draggingNode) return;
    resetStable();

    var pos = zoomer.getModelPosition(e.clientX, e.clientY);
    layout.setNodePosition(draggingNode.id, pos.x - dragNodeDx, pos.y - dragNodeDy);
    notifyNodePositionChange(draggingNode);
    e.stopPropagation();
    e.preventDefault();
  }

  function removeNode(node) {
  }

  function addLink(link) {
    edges.push(vivasvg.model({
      pos: layout.getLinkPosition(link.id),
      link: link
    }));
  }

  function removeLink(node) {
  }

  function listenToGraphEvents(isOn) {
    graph[isOn ? 'on': 'off']('changed', onGraphChanged);
  }

  function listenToDomEvents(isOn) {
    var visual = svgDoc.getVisual();
    var method = isOn ? 'addEventListener' : 'removeEventListener';
    visual[method]('mousemove', onMouseMove);
    visual[method]('mouseup', onMouseUp);
  }

  function onGraphChanged(changes) {
    resetStable();
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

  function resetStable() {
    isStable = false;
  }
};
