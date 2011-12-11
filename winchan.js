;WinChan = (function() {
  // portable addListener implementation
  function addListener(w, event, cb) {
    if (w.addEventListener) w.addEventListener(event, cb, false);
    else if(w.attachEvent) w.attachEvent('on' + event, cb);
  }

  // checking for IE8 or above
  function isInternetExplorer() {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
      var ua = navigator.userAgent;
      var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
      if (re.exec(ua) != null)
        rv = parseFloat(RegExp.$1);
    }
    return rv >= 8;
  }

  // feature checking to see if this platform is supported at all
  function isSupported() {
    return (window.JSON && window.JSON.stringify &&
            window.JSON.parse && window.postMessage);
  }

  if (isInternetExplorer()) {
    return {
      open: function(url, relay_url, winopts, arg, cb) {
        // first we need to add a "relay" iframe to the document that's served
        // from the target domain.  We can postmessage into a iframe, but not a
        // window
        var iframe = document.createElement("iframe");
        // iframe.setAttribute('name', framename);
        iframe.setAttribute('src', relay_url);
        iframe.style.display = "none";
        iframe.setAttribute('name', "oogabooga");
        document.body.appendChild(iframe);

        // open a window
        var w = window.open(url, "_mozid_signin", winopts); 

        // encode our 'request'
        var req = JSON.stringify({a: 'request', d: arg});

        // post into the iframe
        iframe.contentWindow.postMessage(req, "*");

        // and listen for responses
        addListener(window, 'message', function(e) {
          iframe.contentWindow.postMessage(req, "*");
        });
      },
      onOpen: function(cb) {
        var theFrame = window.opener.frames["oogabooga"];
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
            theFrame.parent.postMessage(JSON.stringify({a: 'response', d: r}),"*");
          });
        }
        addListener(theFrame, 'message', onMessage);

//        theFrame.parent.postMessage('{"a": "resend"}', "*");

/* 
        if (theFrame.data) {
          cb(theFrame.orgin, theFrame.data, cb);
        } else if (typeof theFrame.register === 'function') {
          theFrame.register(function() {
            cb(theFrame.orgin, theFrame.data, cb);
          });
        } else {
          addListener(theFrame, 'load', function(e) {
            if (theFrame.data) {
              cb(theFrame.orgin, theFrame.data, cb);
            } else {
              theFrame.register(function() {
                cb(theFrame.orgin, theFrame.data, cb);
              });
            } 
          });
        }
*/
      }
    };
  } else if (isSupported()) {
    return {
      open: function(url, relay_url, winopts, arg, cb) {
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
            window.opener.postMessage(JSON.stringify({a: 'response', d: r}),"*");
          });
        }
        addListener(window, 'message', onMessage);
        window.opener.postMessage('{"a": "resend"}', "*");
      }
    };
  } else {
    return {
      open: function(url, winopts, arg, cb) {
        setTimeout(function() { cb("unsupported browser"); }, 0);
      },
      onOpen: function(cb) {
        setTimeout(function() { cb("unsupported browser"); }, 0);
      }
    };
  }
})();
