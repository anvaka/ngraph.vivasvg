var svgns = "http://www.w3.org/2000/svg";
var domParser = new DOMParser();

module.exports = function (template) {
  if (!template) return;

  var templateDom = domParser.parseFromString('<g xmlns="' + svgns + '">' + template +'</g>', 'text/xml');
  // 0 is for `g` element, then iterate over its child nodes:
  var protoRoot = templateDom.childNodes[0].childNodes;

  return function (model) {
    var layers = {};
    var compiledElement = {
      model: model,
      layers : layers
    };

    var bindingReplacement = createBindReplacement(model);

    for (var i = 0; i < protoRoot.length; ++i) {
      if (protoRoot[i].nodeType !== 1) continue; // Only elements are respected at top level

      var protoChild = protoRoot[i].cloneNode(true);
      var layerName = protoChild.getAttributeNS && protoChild.getAttributeNS(null, 'layer');

      bind(protoChild, model, bindingReplacement);
      addToLayer(layerName, protoChild);
    }

    return compiledElement;

    function addToLayer(layerName, subtree) {
      layerName = layerName || '_default';
      var layer = layers[layerName] || (layers[layerName] = createLayer());
      layer.appendChild(subtree);
    }
  };
};

function createLayer() {
  return document.createElementNS(svgns, 'g');
}

function bind(element, model, bindingReplacement) {
  if (element.attributes) {
    bindAttributes(element, model, bindingReplacement);
  }

  if (element.nodeType === 3) { // TEXT_NODE
    bindValue(element, model, bindingReplacement);
  }

  if (element.childNodes) { // travers down, if we need
    for (var i = 0; i < element.childNodes.length; ++i) {
      bind(element.childNodes[i], model, bindingReplacement);
    }
  }
}

function bindAttributes(element, model, bindingReplacement) {
  for (var i = 0; i < element.attributes.length; ++i) {
    var attr = element.attributes[i];
    var newValue = attr.nodeValue.replace(/{{(.+?)}}/g, bindingReplacement);
    if (newValue !== attr.nodeValue) {
      element.setAttributeNS(attr.namespaceURI, attr.localName, newValue);
    }
  }
}

function bindValue(element, model, bindingReplacement) {
  var newValue = element.nodeValue.replace(/{{(.+?)}}/g, bindingReplacement);
  if (newValue !== element.nodeValue) {
    element.nodeValue = newValue;
  }
}

function createBindReplacement(model) {
  return function bindingSubstitue(match, name) {
    var subtree = name.split('.');
    var localModel = model;

    for (var i = 0; i < subtree.length; ++i) {
      localModel = localModel[subtree[i]];
      // Attribute is not found on model. TODO: should we show warning?
      if (!localModel) return '';
    }

    return localModel;
  };
}
