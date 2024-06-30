const http = require("http");
const fs = require("fs").promises;
const uri = require("./private/http/utilities/uri.js");
const static = require("./private/http/static.js");

const host = "localhost";
const port = 8510;

const requestListener = function(req, res) {
  const url = new uri.URIPath(req.url);
  const pathname = url.pathname;

  switch (req.method) {
    case "GET":
      if (pathname === "/") {
        // Redirect
        res.setHeader("Location", "/mk8dx" + (url.query ?? ""));
        res.writeHead(301);
        res.end();
        return;

      } else if (pathname === "/mk8dx") {
        static.serveFile(req, res, "/mk8dx.html");

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
