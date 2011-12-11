;WinChan = (function() {
  // a portable addListener implementation
  function addListener(w, event, cb) {
    if(w.attachEvent) w.attachEvent('on' + event, cb);
    else if (w.addEventListener) w.addEventListener(event, cb, false);
  }

  // a portable removeListener implementation
  function removeListener(w, event, cb) {
    if(w.detachEvent) w.detachEvent('on' + event, cb);
    else if (w.removeEventListener) w.removeEventListener(event, cb, false);
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
    /*  This is how we roll on IE:
     *  0. user clicks
     *  1. caller adds relay iframe (served from trusted domain) to DOM
     *  2. caller opens window (with content from trusted domain)
     *  3. window on opening adds a listener to 'message'
     *  4. window on opening finds iframe
     *  5. window checks if iframe is "loaded" - has a 'doPost' function yet
     *  5a. if iframe.doPost exists, window uses it to send ready event to caller
     *  5b. if iframe.doPost doesn't exist, window waits for frame ready
     *   5bi. once ready, window calls iframe.doPost to send ready event
     *  6. caller upon reciept of 'ready', sends args
     */
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

        var w = window.open(url, null, winopts); 

        var req = JSON.stringify({a: 'request', d: arg});

        function onMessage(e) {
          try {
            var d = JSON.parse(e.data);
            if (d.a === 'ready') {
              iframe.contentWindow.postMessage(req, "*");
            }
            else if (d.a === 'response') {
              removeListener(window, 'message', onMessage);
              document.body.removeChild(iframe);
              cb(null, d.d);
            }
          } catch(e) { }
        };

        addListener(window, 'message', onMessage);
      },
      onOpen: function(cb) {
        var theFrame = window.opener.frames["oogabooga"];

        var source;
        function onMessage(e) {
          var d, o = e.origin;
          try {
            d = JSON.parse(e.data);
          } catch(e) { }
          source = e.source;
          cb(o, d.d, function(r) {
            theFrame.doPost(JSON.stringify({a: 'response', d: r}),"*");
          });
        }
        addListener(theFrame, 'message', onMessage);

        // we cannot post to our parent that we're ready before the iframe
        // is loaded.
        try {
          theFrame.doPost('{"a": "ready"}', "*");
        } catch(e) {
          // XXX: Some cases on IE9 have been observed where
          // this doesn't work.  More testing required.
          addListener(theFrame, 'load', function(e) {
            theFrame.doPost('{"a": "ready"}', "*");
          });
        }
      }
    };
  } else if (isSupported()) {
    return {
      open: function(url, relay_url, winopts, arg, cb) {
        var w = window.open(url, null, winopts); 
        var req = JSON.stringify({a: 'request', d: arg});
        addListener(window, 'message', function(e) {
          try {
            var d = JSON.parse(e.data);
            if (d.a === 'ready') w.postMessage(req, "*");
            else if (d.a === 'response') cb(null, d.d);
          } catch(e) { }
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
        window.opener.postMessage('{"a": "ready"}', "*");
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
