$(document).ready(function(){
  asyncTest("basic passing and returning of params to winchan", function() {
    var argString = "This is a string we'll send into and back from the dialog: " +
      (new Date()).toString();
    WinChan.open("cases/basic/child.html", "/relay.html", "width=700,height=375", argString, function(err, resp) {
      equal(resp, argString);
      start();
    });
  });
});
