module.exports = function (domContainer) {
  var events = require('ngraph.events'),
      domCallbacks = {};
      emitter = events({});

  if (!domContainer) {
    return emitter;
  }

  var addWheelListner = require('wheel');

  addWheelListner(domContainer, proxyWheel);

  var prefix = '', _addEventListener, _removeEventListener;

  // detect event model
  if (window.addEventListener) {
    _addEventListener = 'addEventListener';
    _removeEventListener = 'removeEventListener';
  } else {
    _addEventListener = 'attachEvent';
    _removeEventListener = 'detachEvent';
    prefix = 'on';
  }

  var mouseEvents = ['mousedown', 'mousemove', 'mouseup'];
  mouseEvents.forEach(proxyEvent);

  emitter.dispose = function () {
    emitter.off(); // shut down the emitter;

    // and dispose dom callbacks:
    for (var eventName in domCallbacks) {
      if (domCallbacks.hasOwnProperty(eventName)) {
        domContainer[_removeEventListener](prefix + eventName, domCallbacks[eventName]);
      }
    }
    // todo: this should be part of wheel itself:
    domContainer[_removeEventListener]('wheel', proxyWheel);
  };

  return emitter;

  function proxyEvent(eventName) {
    domCallbacks[eventName] = function (e) { emitter.fire(eventName, e); };
    domContainer[_addEventListener](prefix + eventName, domCallbacks[eventName]);
  }

  function proxyWheel(e) {
    emitter.fire('wheel', e);
  }
};
