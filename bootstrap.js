// ---- begin copy-paste bootstrap
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import('resource://gre/modules/Services.jsm');

function loadIntoWindow(window) {
  if (!window)
    return;
  // Add any persistent UI elements
  // Perform any other initialization
}

function unloadFromWindow(window) {
  if (!window)
    return;
  // Remove any persistent UI elements
  // Perform any other cleanup
}

var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("UIReady", function onLoad() {
      domWindow.removeEventListener("UIReady", onLoad, false);
      loadIntoWindow(domWindow);
    }, false);
  },

  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(aData, aReason) {
  // Load into any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;

  // Stop listening for new windows
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}

// ---- end copy-paste

/*
 * Copyright (c) 2014, Richard Quirk All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/PageActions.jsm");

// get javascript.enabled pref:
var branch = Services.prefs.getBranch("javascript.");

var menuId;
var uuid = null;

function toggleJavaScript(window) {
  var isEnabled = !branch.getBoolPref("enabled");
  window.NativeWindow.menu.update(menuId, { checked: isEnabled });
  branch.setBoolPref("enabled", isEnabled);
  addAction(window);
}

function addAction(window) {
  if (uuid != null)
    PageActions.remove(uuid);
  uuid = PageActions.add({
    icon: getIcon(),
    title: "Toggle JS",
    clickCallback: function() {
      toggleJavaScript(window);
      var isEnabled = !branch.getBoolPref("enabled");
    }
  });
}

function loadIntoWindow(window) {
  if (!window)
    return;
  menuId = window.NativeWindow.menu.add({
    name:"JavaScript",
    icon: null,
    checkable: true,
    parent: window.NativeWindow.menu.toolsMenuID,
    callback: function() {
    toggleJavaScript(window);
  }});

  addAction(window);

  window.NativeWindow.menu.update(menuId,
    { checked: branch.getBoolPref("enabled") });

}

function getIcon() {
  var isEnabled = !branch.getBoolPref("enabled");
  return isEnabled ? ENABLED_ICON : DISABLED_ICON;
}

function unloadFromWindow(window) {
  if (!window)
    return;
  window.NativeWindow.menu.remove(menuId);
  PageActions.remove(uuid);
}

const DISABLED_ICON = "data:image/png;base64,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";

const ENABLED_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABBCAYAAACO98lFAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gwVEgEoddtz9gAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAMbSURBVHja7dlbSFRBGAfw/8zZ9axmXirSVNaMLohQ0WUlciNMCyQjBM0ogoKwl65PQURYL/US+tAFIsKnDLSIpKLIQJBQybwgSaUppYnp5oVy3ctMD0seFW+Up7Puft/TwOyeM/xm5pvLYbLLIhHMETcCDgpCIARCIARCIARCIARCIARCIARCIARCIARCIIS/DJOeD2fxzrGy7LJM+RunU6L0sRcPnwk0tAj0OQCPB1gcDljjGVLWMmzbzLFnJ8fqJH36jOl50TobQmOLQG6BGx8/z60J00H+Uxh50dr1TSI9zzUGkGHnqCgxo7NWhbNdRXe9ivI7ZuRlcyh8AU+HmeJKkQeOAV+54LCC29fME+pXxAA5WQpyshS0dQicueTRb9oaNR2sW5340u0rd9SoSExgxvSGkdOhp1crL40O0iUyOlIrl1V4gxMhPU179YnzHpy+6EZ1ncDo6P//KmhYTmj9JGDLcmH458T/hJiBlHUMto0cu9I49mZwhIYyXXOCofuE+maBo2fdaHo/fROiIoALp0w4V6CAcxZ4CAAgpcTLKoGyCoGqGoEPbRJTNejAPo77N81gjAUewuQYGpZ42yTw/LXAvQdefHdodSVFZhzJVQIfYXwMDklk5rtQ1+hrot3GUPVIDZx9wlwiMoKh+LK2k5wpdwT0UXpDipYDfo0E6X1CT6/W+7HLAwxhd74L75rFzEdnKVF4XTs4Ze5QdGmLYYnxT932LQwH9yuwp3IkJjCELwL6HEBNvUDxXS8qq31Q4WFA06sQJFnnud+MXB3G180WKxMYSm+ZkbpJh4EbN6LffYLXq9maphjF7W9CUFktUNcg0dwq0PlVov8H4HYDYaFAXCzD+mSG7EwFedkcqqrf1lm3kTA4JBGVPAoAWBIF9LdY4Jeh5z6hrVOzXWVl8OfQDeHJCy3z21P9eyWe95wwMChR/tSLqzc8Y/ng+CEleBAmZ3wGoKjQhOQ1QTYSLCoQswxIs3GcPGbSZ1nzZwRdPo4s5MRICIRACIRACIRACIRACIRACIRACIRACIQQyMGklDLYEX4Dksoh5efYTrYAAAAASUVORK5CYII="
