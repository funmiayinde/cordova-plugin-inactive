# cordova-plugin-inactive
This is to check if the app or the device is inactive for X amount of time set by the developer

# How to install it

cordova plugin add https://github.com/funmiayinde/cordova-plugin-inactive.git

# How to use it

var detectionIntervalInSeconds = 10; // in milliseconds

var getStateCallback = function(state) {
      
      console.log("Inactive Get State: " +  state);
      
      // do anything with the state here
 };
 
inactive.getState(detectionIntervalInSeconds, getStateCallback); 


inactive.onStateChanged.addListener(stateListener); // get the state of the app i.e active, inactive, or when the device is locked


inactive.setDetectionInterval(10); // set the detection interval for inactive activity
