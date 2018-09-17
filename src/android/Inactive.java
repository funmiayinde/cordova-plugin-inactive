package com.cordova.plugin;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;
import org.json.JSONException;


public class Inactive extends CordovaPlugin {

    private BroadcastReceiver lockReceiver;
    private CallbackContext lockCallbackContext;

    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        if ("initialize".equals(action)) {
            initialize(callbackContext);
            return true;
        }
        return false;
    }

    private void initialize(final CallbackContext callbackContext) {
        // Store the callback context for later use.
        this.lockCallbackContext = callbackContext;

        // An InterFilter for lock
        IntentFilter intentFilter = new IntentFilter(Intent.ACTION_SCREEN_ON);
        intentFilter.addAction(Intent.ACTION_SCREEN_OFF);

        // creating a broadcastreceiver and pass along the callback context to use, and register it
        this.lockReceiver = new LockReceiver();
        webView.getContext().registerReceiver(this.lockReceiver, intentFilter);

    }

    private void flush() {
        // Unregister the broadcastreceiver
        if (this.lockReceiver != null) {
            webView.getContext().unregisterReceiver(this.lockReceiver);
            this.lockReceiver = null;
        }

        this.lockCallbackContext = null;

    }

    public void onDestroy(){
        flush();
    }

    public void onReset() {
        flush();
    }

    private class LockReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context,Intent intent) {
            // get the new state based on the intent
            String newState = null;
            if (intent.getAction().equals(Intent.ACTION_SCREEN_ON)) {
                newState = "active";
            }else if (intent.getAction().equals(Intent.ACTION_SCREEN_OFF)) {
                newState = "locked";
            }

            // Create and return plugin result
            PluginResult result = new PluginResult(Status.OK, newState);
            result.setKeepCallback(true);
            lockCallbackContext.sendPluginResult(result);
        }
    }

}