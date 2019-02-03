const http = require("http");
const https = require("https");

module.exports = function(options, protocol, cb) {
  return (/https/i.test(protocol) ? https : http).request(
    options,
    proxyRes => {
      cb(proxyRes);
    }
  );
};
