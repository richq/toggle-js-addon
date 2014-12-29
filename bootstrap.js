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

// get javascript.enabled pref:
var branch = Services.prefs.getBranch("javascript.");

var menuId;
var uuid = null;

function toggleJavaScript(window) {
  var isEnabled = branch.getBoolPref("enabled");
  branch.setBoolPref("enabled", !isEnabled);
  window.NativeWindow.menu.update(menuId, { checked: !isEnabled });
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

const ENABLED_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gwWEy0qsZO8rQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAASISURBVHja7ZxbTBxVGMd/M7vLQsWWirEVyNYaL9kQqvECMS7G1CIGREmTYo3GRBNEmnh90lhiKiTVF0MfFCMxpk/WpFU3QqUaa0IgBonYsiE0KrWgoNEuFhrltjvjww4s0GWZYe9z5v+0YZjwfb853+0MZ8GSJUuWUidp9Q/U8Wwj9xcA1YAHKAFcQH6KffIDY4AP6AE6gQn9Hs0gSVLMgCqBRuDRDFkIXqANOGUUkGzwD7mBz4GuDIKDZmuXZrvbyI1GANUDgxkGJhKoQc2XuAJqBj4A7CbIu3bNl+Z4AWoGDpqwQB3UA0nWEVZmhLMcUv1Gy7xbi1c75lYA2AUMG61ihwWAs5iTDhsNscoMr1YbqW6VRgA1CjhVNOrNQQXAuKCjVyEFMxPr5aBqgWfTaj0h5hEYkEcPoBKBAZXoAeQSGJBLD6B8gQHlxzLNCykLkAUo9jkkaZIKZyMNxSs0O6tyzBvk0y8VzgwpXJyEQACuzgVXoUTxLRL33ClTeb/MTTsT/3wjddJqqgCdHVLY17DAz7/qM8HgCwZ9KpiRYtmTTpjG/1DZXTe/BGdPuUzHUQej3zuZPe9kYsDJiXYHdTUyNtmkIRZNza0BJi+FPjc8aeP9tx0rrl+/DfZW2dhbZWPkgsJLbwSSkxbSJcRcd8/ym/b26kKfkx1FUmqeVLqG2J9/LevWtlpl/gpt3RL+fLwjaAFard2esCnPvRrgxaYFevsV5ubUlNqVNjno3C8KpVXzXP535T1ZDii+VaL0dpkHPDIP75HJyUlgflqVg9KqDxrwKTz98gKDw2ubkLcZXn/BzisNNmRZEgsQgKqqfN2tcLxDobtP4acRlUgGPfaIzMfvOVa8ohEC0GpNX1b5YVCh61uFjz4J8vdk+NrRVgdP7bOJDWi5pqZVKvbP0382ZGJ5qUT3Z04x+iA92rJZ4sib4Q47Wq4SdrvjtuLw0/1vxtoPitBxh1fN9usEAvTg/nl+9CnRtzdUlUPvhIfUivtsCbcrbZL04rV775J4vNZGeZnMjiKJ3Kvg4iT0DSgc+TDI6d4QxNxNMPhNFjtdcX7G6VrFll9bTzcUSRxrc1B2RwICYBWgpO0HBYNh7vYIkXH+uyxO9yr0n1HxnVMY/V3F/w8sLMCmHCjYLrHLLVFTYaOuRsbpTM52SNJW0NS0Sp57DoBr8sA/lE1aKlV90MhomPuNLolMUdIAffFVuEKVl2VOd5HwHHRpSuXEySBvvRtYyj/1T9gsQJEqkwS0HrLjvtlaQUvKdsK2a8FTKvP8M/bElOZMBZSQF3tmTdJmAuQXmIdfD6AxgQGN6QHkExiQTw+gHoEB9egB1CkwoE49gCYInfEUTV4iHP5dq8y3CQiozUgfdEqwVeRljRPR0RrF1wgdNjO7ApqvhjvpYeCAAIAOsHjacAOjRjvQYmI4LZqPMc1iTSaF1KL5FpdhtQl41iQ5KaD50qTnl41M8+2ETgdncnXzaj60xzLNs07irgUeyjBQXs3m2mgJOZKsr8e5wqP1vh5HVRFdcf+vNUuWLK2l/wF/73XB3BYnvAAAAABJRU5ErkJggg==";
