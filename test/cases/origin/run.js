$(document).ready(function(){
  asyncTest("origin is correct same as mine", function() {
    var argString = "This is a string we'll send into and back from the dialog: " +
      (new Date()).toString();
    WinChan.open("cases/origin/child.html", "/relay.html", "width=700,height=375", null, function(err, resp) {
      equal(resp, /^(https?:\/\/[-_a-zA-Z\.0-9:]+)/.exec(window.location.href)[1]);
      start();
    });
  });

  asyncTest("different origin correctly reported", function() {
    var argString = "This is a string we'll send into and back from the dialog: " +
      (new Date()).toString();
    var other_url = 'http://127.0.0.1:8200/test/cases/origin/child.html';
    WinChan.open(other_url, "http://127.0.0.1:8200/relay.html", "width=700,height=375", null, function(err, resp) {
      equal(resp, /^(https?:\/\/[-_a-zA-Z\.0-9:]+)/.exec(window.location.href)[1]);
      start();
    });
  });
});
