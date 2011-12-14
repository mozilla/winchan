## An abstraction for opening browser windows cross domain

Here's the scenario:  You want to build a secure means of some untrusted site
opening a window, which loads content at a trusted site.  Then you want the 
untrusted dude to be able to pass in parameters.  Then you want the trusted
code to do any amount of stuff, and return a response.

This kinda thing is what lots of services on the web do, services
like [BrowserID][].

  [BrowserID]: https://browserid.org

Trouble is that this is stupidly hard:

  * Mobile Firefox doesn't like it when you open windows with window options
  * IE 8 & 9 don't even allow postMessage between opener and window
  * iOS 5 has some interesting optimizations that can bite you if not careful
  * you should tightly check origins to avoid classes of attacks
  * you probably will have to add stuff in the DOM, you should make sure you
    can clean this up and avoid introducing fragile code

WinChan is an abstraction to solve these problems and make it easy to open
windows which take and return parameters and load content cross domain.

## Browser Support

WinChan is expected to work on:

  * winxp - win7 on IE8 and IE9
  * windows, linux, osx - Chrome, Firefox, Opera, and Safari
  * Android's "native" browser - 2.1, 2.2, 2.3.4, 3.2 (and presumably newer)
  * Fennec on Android

## Usage

For the site spawning the window, the "untrusted" or "client" code:

    WinChan.open(
      "http://trusted.host/dialog.html",
      "http://trusted.host/relay.html",
      "menubar=0,location=0,resizable=0,scrollbars=0,status=0,dialog=1,width=700,height=375",
      {
        these: "things",
        are: "input parameters"
      },
      function(err, r) {
        // err is a string on failure, otherwise r is the response object
      }
    );

For the site providing the window, the "trusted" code:

    WinChan.onOpen(function(origin, args, cb) {
      // origin is the scheme+host+port that cause window invocation,
      // it can be trusted

      // 'r' are the untrusted arguments provided by the calling site

      // and cb you can call within the function, or synchronously later.
      // calling it indicated the window is done and can be closed.
      cb({
        "these things": "are the response"
      });
    });

Finally, you'll notice that the trusted code needs to host 'relay.html' somewhere (required
for IE support).

