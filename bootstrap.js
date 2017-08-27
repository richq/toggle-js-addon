// ---- begin copy-paste bootstrap
"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import('resource://gre/modules/Services.jsm');

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
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyGetter(this, "Strings", function() {
  return Services.strings.createBundle("chrome://togglejavascript/locale/togglejavascript.properties");
});

// get javascript.enabled pref:
var branch = Services.prefs.getBranch("javascript.");

var menuId;
var uuid = null;

function canReload(window) {
  try {
    var location = "" + window.BrowserApp.selectedTab.window.location;
    return !location.startsWith('about:');
  } catch (err) {
    return false;
  }
}

function requestReload(window) {
  if (!canReload(window))
    return;
  let buttons = [
    {
      label: Strings.GetStringFromName("yes.reload"),
      positive: true,
      callback: function() {
        // reload current tab, if it is not emptyness or the special 'about:home'
        if (canReload(window))
          window.BrowserApp.selectedTab.browser.reload();
      }
    },
  ];
  let message = Strings.GetStringFromName("question.reload");
  let opts = {
    persistence: 1,
    timeout: 3000
  };

  window.NativeWindow.doorhanger.show(message, "request-reload", buttons,
                                      window.BrowserApp.selectedTab.id,
                                      opts);
}

function toggleJavaScript(window) {
  var isEnabled = branch.getBoolPref("enabled");
  var newEnabled = !isEnabled;
  branch.setBoolPref("enabled", newEnabled);
  window.NativeWindow.menu.update(menuId, { checked: newEnabled });
  addAction(window);
  if (newEnabled)
    requestReload(window);
}

function addAction(window) {
  if (uuid != null)
    PageActions.remove(uuid);
  uuid = PageActions.add({
    icon: getIcon(),
    title: getTitle(),
    clickCallback: function() {
      toggleJavaScript(window);
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

function getTitle() {
  var isEnabled = branch.getBoolPref("enabled");
  var enabled = Strings.GetStringFromName(isEnabled ? "menu.on" : "menu.off");
  return Strings.GetStringFromName("menu.title") + " " + enabled;
}

function getIcon() {
  var isEnabled = branch.getBoolPref("enabled");
  return isEnabled ? ENABLED_ICON : DISABLED_ICON;
}

function unloadFromWindow(window) {
  if (!window)
    return;
  window.NativeWindow.menu.remove(menuId);
  PageActions.remove(uuid);
}

const DISABLED_ICON = "data:image/png;base64,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";

const ENABLED_ICON = "data:image/png;base64,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";
