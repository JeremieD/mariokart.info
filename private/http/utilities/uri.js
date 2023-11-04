class URIPath {
	constructor(raw) {
		const matches = raw.match(/^(\/(?:\w*\/?)*?([\w-]+(?:\.(\w+))?)?)(\?.*)?$/) ?? "";

		this.pathname = matches[1]; // The path without the query.
		this.filename = matches[2]; // The filename, including the extension.
		this.extension = matches[3]; // The letters after the final dot.
		this.query = matches[4]; // The complete query, starting with "?".
		this.parameters = {}; // The query parameters as an associative array.

		if (this.query !== undefined) {
			const rawQuery = this.query.substring(1);
			const rawParams = rawQuery.split("&");

			for (const rawParam of rawParams) {
				const param = rawParam.split("=");
				this.parameters[param[0]] = param[1];
			}
		}
	}
}

module.exports = { URIPath };
