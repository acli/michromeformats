// Global accessor that the popup uses.
var hcards      = {};
var hcalendars  = {};
var hreviews    = {};
var hreviewaggs = {};
var hrecipes    = {};
var geos        = {};
    
// Set up OAuth for a secure connection between Google and this plugin
// https://www.google.com/m8/feeds/ is for Google Contacts
// https://www.google.com/calendar/feeds/ is for Google Calendar
var SCOPE = 'https://www.google.com/m8/feeds/ https://www.google.com/calendar/feeds/';

var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': SCOPE,
  'app_name': 'Michromeformats'
});

// Log out, can it be even simpler?
function logout(){
  oauth.clearTokens();
}

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  var tabId          = sender.tab.id;
  hcards[tabId]      = request.hcards;
  hcalendars[tabId]  = request.hcalendars;
  hreviews[tabId]    = request.hreviews;
  hreviewaggs[tabId] = request.hreviewaggs;
  hrecipes[tabId]    = request.hrecipes;
  geos[tabId]        = request.geos;
      
  // convert JSON back to objects that the popup can use
  for (var i = 0; i < hcards[tabId].length; i++) {
    hcards[tabId][i] = JSON.parse(hcards[tabId][i]);
  }
  for (var j = 0; j < hcalendars[tabId].length; j++) {
    hcalendars[tabId][j] = JSON.parse(hcalendars[tabId][j]);
  }
  for (var k = 0; k < hreviews[tabId].length; k++) {
    hreviews[tabId][k] = JSON.parse(hreviews[tabId][k]);
  }
  for (var m = 0; m < hreviewaggs[tabId].length; m++) {
    hreviewaggs[tabId][m] = JSON.parse(hreviewaggs[tabId][m]);
  }
  for (var l = 0; l < hrecipes[tabId].length; l++) {
    hrecipes[tabId][l] = JSON.parse(hrecipes[tabId][l]);
  }
  for (var g = 0; g < geos[tabId].length; g++) {
    geos[tabId][g] = JSON.parse(geos[tabId][g]);
  }
      
  // display the icon in the address bar
  if (hcards[tabId].length > 0 || hcalendars[tabId].length > 0 || hreviews[tabId].length > 0 || hreviewaggs[tabId].length > 0 || hrecipes[tabId].length > 0 || geos[tabId].length > 0) {
    chrome.pageAction.show(tabId);
  }
      
  // call sendResponse with an empty object to allow the request to be cleaned up
  sendResponse({});
});
