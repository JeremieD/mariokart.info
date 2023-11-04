const http = require("http");
const fs = require("fs").promises;
const uri = require("./private/http/utilities/uri.js");
const static = require("./private/http/static.js");

const host = "localhost";
const port = 8510;

const requestListener = function(req, res) {
  const pathname = new uri.URIPath(req.url).pathname;

  switch (req.method) {
    case "GET":
      if (pathname === "/") {
        static.serveFile(req, res, "/index.html");

      } else if (req.url.startsWith("/resources/")) {
        static.serveFile(req, res);

      } else {
        static.serveError(res);
      }

      break;

    case "POST":
      static.serveError(res, "", 403);
      break;

    default:
      static.serveError(res, "", 405);
  }
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
