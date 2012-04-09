(function() {
  var getActiveWindow, install, onExtRequest, onTabCreated, onTabUpdated, root, shareLink, sharePage, shareSelection, shareWithHotot, showHototTab, tabChangedHandler, uninstall;

  tabChangedHandler = function(tab) {
    if (tab.url.indexOf(chrome.extension.getURL("index.html")) !== -1) {
      if (root._hototTab) {
        if (tab.id !== root._hototTab.id) showHototTab();
      } else {
        root._hototTab = tab;
      }
    }
  };

  sharePage = function(info, tab) {
    shareWithHotot(tab.title + ' ' + info.pageUrl);
  };

  shareSelection = function(info, tab) {
    shareWithHotot("\"" + info.selectionText + "\" via: " + info.pageUrl);
  };

  shareLink = function(info, tab) {
    shareWithHotot(info.linkUrl);
  };

  getActiveWindow = function() {
    var v, views, _i, _len;
    views = chrome.extension.getViews();
    for (_i = 0, _len = views.length; _i < _len; _i++) {
      v = views[_i];
      if (v.location.href === root._hototTab.url) return v;
    }
    return null;
  };

  showHototTab = function() {
    var proc;
    if (root._hototTab) {
      proc = function(c) {
                if (c.focused != null) {
          c.focused;
        } else {
          chrome.windows.update(c.id, {
            focused: true
          });
        };
      };
      chrome.tabs.get(root._hototTab.id, function(c) {
        root._hototTab = c;
        return chrome.windows.get(c.windowId, proc);
      });
      chrome.tabs.update(root._hototTab.id, {
        selected: true
      });
    }
  };

  shareWithHotot = function(str) {
    var _doShare;
    _doShare = function() {
      var win, _testProc;
      win = getActiveWindow();
      _testProc = function() {
        if (win.globals) {
          if (win.globals.signed_in) {
            win.ui.StatusBox.change_mode(win.ui.StatusBox.MODE_TWEET);
            win.ui.StatusBox.set_status_text(str);
            return win.ui.StatusBox.open();
          } else {
            return win.toast.set('You must sign in to share content.').show(-1);
          }
        } else {
          return setTimeout(_testProc, 500);
        }
      };
      return _testProc();
    };
    if (root._hototTab && root._hototTab.id) {
      showHototTab();
      _doShare();
    } else {
      chrome.tabs.create({
        url: "index.html"
      }, function() {
        return setTimeout(_doShare, 500);
      });
    }
  };

  onTabCreated = function(tab) {
    tabChangedHandler(tab);
  };

  onTabUpdated = function(id, info, tab) {
    tabChangedHandler(tab);
  };

  onExtRequest = function(req, sender, response) {
    if (req.enableContextMenu) {
      install();
      response({
        'reply': 'getcha, context menu has been enabled.'
      });
    } else {
      uninstall();
      response({
        'reply': 'getcha, context menu has been disabled.'
      });
    }
  };

  install = function() {
    var contexts;
    contexts = ["page", "selection", "link"];
    if (root._menuItemSharePageId === null) {
      root._menuItemSharePageId = chrome.contextMenus.create({
        "title": "Share Page with Hotot",
        "contexts": ["page"],
        "onclick": sharePage
      });
    }
    if (root._menuItemShareSelId === null) {
      root._menuItemShareSelId = chrome.contextMenus.create({
        "title": "Share Selection with Hotot",
        "contexts": ["selection"],
        "onclick": shareSelection
      });
    }
    if (root._menuItemShareLinkId === null) {
      root._menuItemShareLinkId = chrome.contextMenus.create({
        "title": "Share Link with Hotot",
        "contexts": ["link"],
        "onclick": shareLink
      });
    }
  };

  uninstall = function() {
    chrome.contextMenus.removeAll();
    root._menuItemSharePageId = null;
    root._menuItemShareSelId = null;
    root._menuItemShareLinkId = null;
    if (chrome.tabs.onCreated.hasListener(onTabCreated)) {
      chrome.tabs.onCreated.removeListener(onTabCreated);
    }
    if (chrome.tabs.onUpdated.hasListener(onTabUpdated)) {
      chrome.tabs.onUpdated.removeListener(onTabUpdated);
    }
  };

  chrome.tabs.onCreated.addListener(onTabCreated);

  chrome.tabs.onUpdated.addListener(onTabUpdated);

  chrome.extension.onRequest.addListener(onExtRequest);

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root._hototTab = null;

  root._install = install;

  root._uninstall = uninstall;

  root._menuItemSharePageId = null;

  root._menuItemShareSelId = null;

  root._menuItemShareLinkId = null;

}).call(this);
