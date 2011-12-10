;WinChan = (function() {
  function addListener(w, event, cb) {
    if (w.addEventListener) w.addEventListener(event, cb, false);
    else if(w.attachEvent) w.attachEvent('on' + event, cb);
  }

  return {
    open: function(url, winopts, arg, cb) {
      var w = window.open(url, null, winopts); 
      var req = JSON.stringify({a: 'request', d: arg});
      w.postMessage(req, "*");
      addListener(window, 'message', function(e) {
        try {
          var d = JSON.parse(e.data);
          if (d.a === 'resend') {
            w.postMessage(req, "*");
          } else if (d.a === 'response') cb(null, d.d);
        } catch(e) {
        }
      });
    },
    onOpen: function(cb) {
      var source;
      function onMessage(e) {
        var d, o = e.origin;
        try {
          d = JSON.parse(e.data);
        } catch(e) {
          // ignore
        }
        source = e.source;
        cb(o, d.d, function(r) {
          window.opener.postMessage(JSON.stringify({a: 'response', d: r}), "*");
        });
      }
      addListener(window, 'message', onMessage);
      window.opener.postMessage('{"a": "resend"}', "*");
    }
  };
})();
