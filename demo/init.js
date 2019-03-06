(function () {
  function loadScript (src, cb) {
    var elem = document.createElement('script');
    var node = document.getElementsByTagName('script')[0];
    elem.async = 1;
    elem.src = src;
    if (cb) {
      elem.onload = cb;
    }
    node.parentNode.insertBefore(elem, node);
    return elem;
  }

  loadScript('track.js', function() {
    loadScript('demo.js');
  });

})()
