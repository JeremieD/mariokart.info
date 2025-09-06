var isMobile = matchMedia("(hover: none)").matches;

// Calls a function once the DOM has loaded.
// Also calls the function if the DOM has *already* loaded.
function whenDOMReady(callback, options = { once: true, passive: true }) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, options);
  } else {
    callback();
  }
}

var viewLoaded = false;
function whenViewReady(callback, options = { once: true, passive: true }) {
  if (!viewLoaded) {
    addEventListener("viewLoaded", callback, options);
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

// Returns whether the click event *e* is inside element *el*.
function isOutside(el, e) {
  const rect = el.getBoundingClientRect();
  // If the click event was fired with a keyboard press, e.detail will be 0.
  if (e.detail === 0) {
    // In that case, clientX and Y will be 0, so we use the target element's position instead.
    const target = e.target.getBoundingClientRect();
    return target.top < rect.top   || target.bottom > rect.bottom
        || target.left < rect.left || target.right > rect.right;
  }
  return e.clientY < rect.top  || e.clientY > rect.bottom
      || e.clientX < rect.left || e.clientX > rect.right;
}

function disableScroll(el) { el.classList.add("no-scroll"); }
function enableScroll(el)  { el.classList.remove("no-scroll"); }

function blockAnimation(el) {
  el.classList.add("no-animation");
  setTimeout(() => { el.classList.remove("no-animation"); }, 500);
}

function parseValue(v, defaultV = 0) {
  v = parseFloat(v);
  if (isNaN(v)) return parseFloat(defaultV);
  return v;
}
