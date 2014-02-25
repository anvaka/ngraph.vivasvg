var svgns = "http://www.w3.org/2000/svg";
var domParser = new DOMParser();

module.exports = function (template, extensions) {
  if (!template) return;
  extensions = extensions || {};

  var templateDom = domParser.parseFromString('<g xmlns="' + svgns + '">' + template +'</g>', 'text/xml');
  // 0 is for `g` element, then iterate over its child nodes:
  var protoRoot = templateDom.childNodes[0].childNodes;

  return function (model) {
    var bindingReplacement = createBindReplacement(model);
    var root = document.createElementNS(svgns, 'g');
    var customControls;

    for (var i = 0; i < protoRoot.length; ++i) {
      if (protoRoot[i].nodeType !== 1) continue; // Only elements are respected at top level
      var element = protoRoot[i];
      var CustomControl = extensions[element.localName];
      if (CustomControl) {
        var control = new CustomControl(element, bindingReplacement);
        control.appendTo(root);
        (customControls || (customControls = [])).push(control);
      } else {
        var protoChild = element.cloneNode(true);
        bind(protoChild, model, bindingReplacement);
        root.appendChild(protoChild);
      }
    }

    return {
      element: root,
      controls: customControls
    };
  };
};

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
