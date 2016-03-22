(function() {
  var net = require('net');
  
  var socket = null;
  var latest = {};
  var listening = false;
  var port = 6555;
  var eyetribe = {
    setup: function() {
      
    },
    stop_listening: function() {
      listening = false;
      socket.destroy();
      socket = null;
    },
    listen: function() {
      if(socket) { return; }
      socket = new net.Socket();
      socket.heartbeatCounter = 0;
      socket.on('data', function(raw_data) {
        data = JSON.parse(raw_data);
        
        if(data.values && data.values.frame) {
          var trackState = data.values.frame.state;
          if(!socket.readyNotified) {
            socket.readyNotified = true;
            console.log("eyetribe state changed to \"tracker_ready\"");
          } else if(socket.lastTrackState != trackState) {
            socket.lastTrackState = trackState;
            var state = "not_tracking";
            if(trackState < 8) {
              state = "fully_tracking";
              if(trackState < 7) {
                state = "partial_tracking";
              }
            }
            console.log("eyetribe state changed to \"" + state + "\"");
            latest.gaze_state = state;
          }
          // console.log(data.values.frame.state + "  " + data.values.frame.avg.x + "," + data.values.frame.avg.y);
          if(data.values.frame.state < 8) {
            latest.gaze_x = data.values.frame.avg.x;
            latest.gaze_y = data.values.frame.avg.y;
            latest.gaze_ts = (new Date()).getTime();
          }
        } else {
          //console.log(data);
        }
        socket.heartbeatCounter++;
        if(data.request == "get" && data.values && data.values.push === false) {
          console.log("eyetribe connected. state: " + JSON.stringify(data.values));
          latest.screen_width = data.values.screenresw;
          latest.screen_height = data.values.screenresh;
          socket.write(JSON.stringify({category: "tracker", request: "set", values: {"push": true}}));
        } else if(_this.heartbeatCounter > 5 && listening) {
          _this.heartbeatCounter = 0;
          socket.write(JSON.stringify({category: "heartbeat"}));
        }
      });
      socket.on('close', function() {
        console.log("socket closed");
        eyetribe.stop_listening();
      });
      socket.on('error', function() {
        console.log("socket error");
        eyetribe.stop_listening();
      });
      socket.connect(port, function() {
        listening = true;
        console.log('socket connected! sending initial message');
        var json = {
          "category": "tracker",
          "request" : "get",
          "values": [ "push", "iscalibrated", "screenresw", "screenresh" ]
        };
        socket.write(JSON.stringify(json));
      });
    },
    ping: function() {
      if(!listening) {
        eyetribe.listen();
      }
      return latest;
      // if not already listening, go ahead and start listening
    }
  };
  module.exports = eyetribe;
})();