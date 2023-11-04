const zlib = require("zlib");

// Set to true to enable compression module.
const compressionEnabled = false;


/*
 * Compresses the passed content according to the given algorithm.
 */
function encode(content, encoding = "identity") {
	if (!compressionEnabled) {
		return content;
	}

	switch (encoding) {
		case "gzip":
			return zlib.gzipSync(content);
		case "deflate":
			return zlib.deflateSync(content);
		case "br":
			return zlib.brotliCompressSync(content);
		case "identity":
			return content;
	}
}


/*
 * Determine the best compression method.
 */
function getBestEncoding(requestedEncodings, contentLength) {
	let encoding = "identity";

	if (compressionEnabled && contentLength > 512) {
		if (requestedEncodings.includes("br")) {
			encoding = "br";
		} else if (requestedEncodings.includes("deflate")) {
			encoding = "deflate";
		} else if (requestedEncodings.includes("gzip")) {
			encoding = "gzip";
		}
	}

	return encoding;
}

module.exports = { encode, getBestEncoding };
