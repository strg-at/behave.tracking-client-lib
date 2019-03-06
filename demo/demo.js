/* eslint-env browser */
(function () {

  var global = window.strgBeHave
  var tracker = global.tracker;

  global.loggerHandler = console;

  tracker.init('ws://localhost:8008');
  tracker.visibilityTracker.init();

  // /* ClientState */
  tracker.clientStateChange('screen.resolution', screen.width + "x" + screen.height);
  screen.orientation && screen.orientation.type &&
    tracker.clientStateChange('screen.orientation', screen.orientation.type);
  tracker.clientStateChange('navigator.user_agent', navigator.userAgent);
  // tracker.clientStateChange('navigator.language', navigator.language);
  // navigator.systemLanguage &&
  //   tracker.clientStateChange('navigator.system_language', navigator.systemLanguage);

  // /* WindowState */
  tracker.windowStateChange('url', window.location.href);
  document.referrer &&
    tracker.windowStateChange('referrer', document.referrer);
  window.location.hash &&
    tracker.windowStateInit('url.hash', window.location.hash);
  window.addEventListener("hashchange", function () {
    tracker.windowStateChange('url.hash', window.location.hash);
  });

  global.tracker.breakpointMeter.percent('.article__body', 'article');

  // var articleId = parseArticleId(location.href);
  // articleId && global.metrics.windowStateChange('article.id', articleId);

  // var articleSelector = 'article[id="article-' + articleId +'"]';
  // if (document.querySelector(articleSelector)) {
  //   global.metrics.breakpointMeter.percent(articleSelector, 'article');
  // }

})();
