/*global cordova, module*/

let exec = require("cordova/exec");
let platform = require("cordova/platform");

const STATE_ACTIVE = "active";
const STATE_INACTIVE = "inactive";
const STATE_LOCKED = "locked";

// this keeps tracks of the current state
let currentState = STATE_ACTIVE;

// this is responsible for listeners calls when the device state change
let stateListeners = [];

// this is the timeout used to trigger the inactive state
let inactiveTimer = null;

// this interval stands for the amount of  inactive time required for the above states listeners to be
// fired with status`inactive`, it will be 60sec by default
let dectectionIntervalsInSeconds = 60;

// This tracks the last time a touch event occurred on the app
let lastTouchedDate = new Date();

exports.getState = function (_detectionIntervalInSeconds, callback) {
    // if the app is locked, life is easy
    if (currentState === STATE_LOCKED) {
        callback(STATE_LOCKED);
        return;
    }

    // We can't simply return the current state.
    // This is because the specified detection interval may be different than the one used to determine the current state.
    let currentDate = new Date();
    millSecondsLastTouch = currentDate.getTime() - lastTouchedDate.getTime();
    if (millSecondsLastTouch >= _detectionIntervalInSeconds * 100) {
        callback(STATE_INACTIVE);
    } else {
        callback(STATE_ACTIVE);
    }
};

exports.setDetectionInterval = function (_detectionIntervalInSeconds) {
    dectectionIntervalsInSeconds = _detectionIntervalInSeconds;
    resetInactiveTimer();
};

exports.onStateChanged = {};
exports.onStateChanged.addListener = function (listener) {
  if (typeof(listener) === "function") {

      stateListeners.push(listener);

  }else {

      console.log("Attempt to add non-function listeners");
  }
};

// This function fires the state listeners with the given state
let fireListeners = function (state) {
  for(let i = 0; i < stateListeners.length; i++) {
      stateListeners[i](state);
  }
};

// this function reset the inactive time
let resetInactiveTimer = function () {
    clearTimeout(inactiveTimer);
    inactiveTimer = setTimeout(changeState,dectectionIntervalsInSeconds * 1000, STATE_INACTIVE);
};

// this function is responsible for change of state
let changeState = function (state) {
  // if new state exist, set it appropriately and fire the state listeners.
  if (currentState !== state) {
      currentState = state;
      fireListeners(state);
  }
};

// handle the touch activity of the app, so we can reset the inactive timer and change of state
let handleTouchEvent = function () {
    lastTouchedDate = new Date();
    resetInactiveTimer();
    changeState(STATE_ACTIVE);
};

// reset the inactive timer
resetInactiveTimer();

// add a touch listener
document.addEventListener("touchstart",handleTouchEvent);

// If we're on Android, add a listener for screen locking.
if (platform.id === "android") {
    let lockCallback = function (newState) {
        // If the device has been unlocked, there must have been a touch event, so we handle that.
        // If the device has been locked, we merely want to change the state to reflect this.
        if (newState === STATE_ACTIVE) {
            handleTouchEvent();
        }else if (newState === STATE_LOCKED) {
            changeState(STATE_LOCKED);
        }
    };
    exec(lockCallback, undefined, "Inactive","initialize", []);
}
