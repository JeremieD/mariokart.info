const fs = require("fs").promises;
const uri = require("./utilities/uri.js");
const compress = require("./utilities/compress.js");

const mimeTypes = {
	html: "text/html",
	css: "text/css",
	js: "application/javascript",
	svg: "image/svg+xml",
	png: "image/png",
	webp: "image/webp",
	woff2: "font/woff2"
}
const cachePolicies = {
	html: "no-cache, private",
	css: "no-cache",
	js: "no-cache",
	svg: "no-cache",
	png: "no-cache",
	webp: "no-cache",
	woff2: "no-cache"
}

/* Structure for fileCache:
 * {
 * 	filePath: {
 *		eTag: "",
 * 		modTime: "",
 *		encodings: {
 *			identity: "",
 * 			gzip: "",
 * 			deflate: "",
 *			br: ""
 *		}
 *	}
 * }
 */
const fileCache = {};


/*
 * Serves the requested file, either from cache or from disk,
 * compressing it if appropriate.
 */
function serveFile(req, res, urlOverride) {
	const path = new uri.URIPath(urlOverride ?? req.url);
	const pathname = path.pathname; // The path without the query.
	const extension = path.extension; // Just the file extension.
	const realPath = "./public" + pathname; // The access path on the disk.

	// If the file extension is unknown, return 404.
	if (mimeTypes[extension] === undefined) {
		serveError(res, "Can’t serve file of type “" + extension + "”");
		return;
	}

	// Fetch stats for file, checking that it exists.
	fs.stat(realPath).then(stats => {

		// Set basic headers.
		res.setHeader("Vary", "Accept-Encoding");
		res.setHeader("Cache-Control", cachePolicies[extension]);

		// Determine the best compression method.
		const requestedEncodings = req.headers["accept-encoding"];
		const encoding = compress.getBestEncoding(requestedEncodings, stats.size);

		let fileCacheIsStale = false;

		// If the cache is fresh...
		if (stats.mtimeMs <= fileCache[pathname]?.modTime) {

			// If the requested ETag corresponds to the one in cache, send 304.
			const requestedETag = req.headers["if-none-match"];
			if (fileCache[pathname].eTag === requestedETag) {
				res.setHeader("ETag", fileCache[pathname].eTag);
				res.writeHead(304);
				res.end();
				return;
			}

			// If not, then check file cache for the right encoding.
			if (fileCache[pathname].encodings[encoding]) {
				serve(req, res, fileCache[pathname].encodings[encoding],
					  mimeTypes[extension], encoding,
					  fileCache[pathname].eTag);
				return;
			}

		} else {
			fileCacheIsStale = true;
		}

		if (fileCache[pathname] === undefined) {
			fileCache[pathname] = {};
		}

		// If the cache is stale, reset cache.
		if (fileCacheIsStale) {
			fileCache[pathname].modTime = stats.mtimeMs;
			fileCache[pathname].eTag = getETagFrom(pathname + stats.mtimeMs);
			fileCache[pathname].encodings = {};
		}

		// Finally, encode, return and cache file.
		res.setHeader("ETag", fileCache[pathname].eTag);

		fs.readFile(realPath).then(contents => {
			fileCache[pathname].encodings[encoding] = compress.encode(contents, encoding);

			serve(req, res, fileCache[pathname].encodings[encoding],
				  mimeTypes[extension], encoding,
				  fileCache[pathname].eTag);
			return;

		})
		.catch(e => {
			serveError(res, "Could not read file: " + e);
		});

	})
	.catch(() => {
		serveError(res, "Can’t find file “" + pathname + "”");
	});
}


/*
 * Serve a 200 response with the given content and headers.
 */
function serve(req, res, content, mimeType, encoding = "identity", eTag) {
	if (encoding === "auto") {
		encoding = compress.getBestEncoding(req.headers["accept-encoding"], content.length * 8);
		content = compress.encode(content, encoding);
	}

	if (encoding !== "identity") {
		res.setHeader("Content-Encoding", encoding);
	}

	res.setHeader("Content-Type", mimeType);

	if (eTag !== undefined) {
		res.setHeader("ETag", eTag);
	}

	res.writeHead(200);
	res.end(content);
}


/*
 * Serve an error with an optional log to the console.
 */
function serveError(res, msg = "", code = 404) {
	if (msg !== "") {
		console.error(msg);
	}
	res.writeHead(code);
	res.end();
}


/*
 * Returns the ETag for the given value.
 * This Etag is based on a simple hash of the passed value.
 */
function getETagFrom(value) {
	let hash;

	for (let i = 0; i < value.length; i++) {
		hash = Math.imul(31, hash) + value.charCodeAt(i) | 0;
	}

	return Math.abs(hash).toString(36);
}


module.exports = { serveFile, serve, serveError };
