const url = require("url");

module.exports = {
  getRequestOptions(req, protocol) {
    const host = req.headers.host;
    const fullUrl =
      protocol === "http" ? req.url : protocol + "://" + host + req.url;
    const urlPattern = url.parse(fullUrl);
    const path = urlPattern.path;
    const options = {
      hostname: urlPattern.hostname || req.headers.host,
      port: urlPattern.port || req.port || (/https/.test(protocol) ? 443 : 80),
      path,
      method: req.method,
      headers: req.headers
    };
    return options;
  }
};
