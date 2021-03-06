var flic = require("../");
var Bridge = flic.bridge;
var Node = flic.node;

var test_bridge;

exports["Bridge construct - nominal"] = function(test){
  test.expect(2);
  test_bridge = new Bridge();
  test.ok(test_bridge instanceof Bridge);
  test.strictEqual(test_bridge.port, 8221);
  test.done();
}

exports["Bridge construct - invalid port number (too low)"] = function(test){
  test.expect(1);
  test.throws(function(){
    var a = new Bridge(1);
  });
  test.done();
}

exports["Bridge construct - invalid port number (too high)"] = function(test){
  test.expect(1);
  test.throws(function(){
    var a = new Bridge(85668);
  });
  test.done();
}

exports["Node construct - nominal"] = function(test){
  test.expect(1);
  var node = new Node("node", function(err){
    test.equal(err, null, "Callback returned an unexpected error.");
    test.done();
  });
}

exports["Node construct - name taken"] = function(test){
  test.expect(1);
  var node = new Node("node", function(err){
    test.equal(err, "Error: Duplicate node name!", "Callback returned a different error than anticipated: '%s'", err);
    test.done();
  });
}

exports["Node construct - invalid name"] = function(test){
  test.expect(1);
  test.throws(function(){
    var node = new Node("&*@dddd", function(){});
  });
  test.done();
}

exports["Node construct - no bridge present"] = function(test){
  test.expect(1);
  var node = new Node("no_bridge", 9887, function(err){
    test.equal(err, "Error: Node could not connect to Bridge!", "Callback returned a different error than anticipated: '%s'", err);
    test.done();
  });
}

var node1, node2;

exports["Node tell - nominal (receiving events)"] = function(test){
  test.expect(1);
  node2 = new Node("node2", function(){});
  node1 = new Node("node1", function(){});
  node1.on("test_event", function(param1){
    test.equal(param1, "testParam", "param1 is not right: %s", param1);
    test.done();
  });

  setTimeout(function() {
    node2.tell("node1:test_event", "testParam");
  }, 25);
}

exports["Node tell - nominal (receiving events and sending callbacks)"] = function(test){
  test.expect(2);
  node1.on("test_event2", function(param1, callback){
    test.equal(param1, "testParam", "param1 is not right: %s", param1);
    callback(null, param1);
  });

  setTimeout(function() {
    node2.tell("node1:test_event2", "testParam", function(err, param2){
      test.equal(param2, "testParam", "param2 is not right: %s", param2);
      test.done();
    });
  }, 25);
}

exports["Node tell - invalid who and what parameter"] = function(test){
  test.expect(1);
  test.throws(function(){
    node1.tell("iaminvalid", "blabla", function(err){});
  });
  test.done();
}

exports["Node tell - non-existent node"] = function(test){
  test.expect(1);
  node2.tell("i_dont_exist:who_cares", function(err){
    test.equal(err, "Error: Attempting to tell non-existent node!", "Callback returned a different error than anticipated: '%s'", err);
    test.done();
  });
};

exports["Node shout - nominal"] = function(test){
  test.expect(1);
  node1.on("shout1", function(param1){
    test.equal(param1, "ilovenodejs", "Shout recipients received an unexpected value from the shouter: %s", param1);
    test.done();
  });
  node2.shout("shout1", "ilovenodejs");
}

exports["Bridge close"] = function(test){
  test.expect(1);
  node1.on("$CLOSE", function(param1){
    test.equal(param1, "ilovenodejs", "Bridge close event recipients received an unexpected value from the shouter: %s", param1);
    test.done();
  });
  test_bridge.close(["ilovenodejs"]);
}

setTimeout(function(){
  process.exit(0);
}, 5000);
