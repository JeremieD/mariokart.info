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
    const httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {

        if (httpRequest.status === 200) {
          try {
            resolve(httpRequest.responseText);
          } catch (e) {
            console.error(e);
            reject(e);
          }

        } else {
          reject(httpRequest.status);
        }
      }
    };

    httpRequest.open("GET", url);
    httpRequest.send();
  });
}

function randomInt(a, b) {
  if (b == undefined) {
    b = a;
    a = 0;
  }
  return Math.round(Math.random() * (b - a) + a);
}

// Round n to p decimal digits.
function round(n, p) { return Math.round(n * 10**p) / 10**p; }

String.prototype.replaceAt = function(i, replacement) {
  return this.substring(0, i) + replacement + this.substring(i + replacement.length);
}
