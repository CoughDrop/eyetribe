## EyeTribe for Node

This is a node module that can listen in for eye tracking events
generated by the EyeTribe server installed on a Windows device.

NOTE: The EyeTribe tracker is no longer publicly available, and this code is kept for reference purposes only.

### Installation and Usage

`npm install https://github.com/coughdrop/eyetribe.git`

```
var eyetribe = require('eyetribe');

eyetribe.setup();

setInterval(function() {
  var data = eyetribe.poll();
  console.log(data.gaze_x + ", " + data.gaze_y);
}, 50);
```

### Technical Notes
This module is connecting to the EyeTribe server directly (download and install 
[the eyetribe sdk](https://theeyetribe.com/order/my-account/), then plug in your tracker), and assumes 
the server is running on the default port, 6555.

This library listens for and remembers the latest `avg` results from the eye tracker.
To be consistent with our other eye tracking libraries, it doesn't emit events, so instead
the javascript is responsible for polling the library for any updated events by calling
`var res = eyetribe.ping()`.

When this library is installed, it should automatically be used by 
[gazelinger.js](https://github.com/CoughDrop/gazelinger) if also installed.

### License

MIT
