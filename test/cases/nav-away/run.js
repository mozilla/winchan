$(document).ready(function(){
  asyncTest("navigate away and then return in dialog", function() {
    var argString = (new Date()).toString();
    WinChan.open("cases/nav-away/child.html", "/relay.html", "width=700,height=375", argString, function(err, resp) {
      equal(resp, argString);
      start();
    });
  });
});
