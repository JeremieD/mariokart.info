// Calls a function once the DOM has loaded.
// Also calls the function if the DOM has *already* loaded.
function whenDOMReady(callback, options = { once: true, passive: true }) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, options);
  } else {
    callback();
  }
}

/**
 * Async wrapper for XMLHttpRequest.
 * @param {string} url - The requested URL.
 * @returns {Promise<string>} The promised response body.
 */
async function httpGet(url) {
  return new Promise(function(resolve, reject) {
    const cacheHit = httpGetCache[url];
    if (cacheHit && Date.now() - cacheHit.time < 86400000) { // 1 day
      return resolve(httpGetCache[url].data);
    }
    const httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          try {
            httpGetCache[url] = {
              time: Date.now(),
              data: httpRequest.responseText
            };
            resolve(httpRequest.responseText);
          } catch (e) {
            console.error(e);
            reject(e);
          }
        } else {
          reject(httpRequest.status);
      } }
    };
    httpRequest.open("GET", url);
    httpRequest.send();
  });
}
// { url: { time, data }, ... }
const httpGetCache = {};

window.structuredClone ??= obj => {
  return JSON.parse(JSON.stringify(obj));
};
