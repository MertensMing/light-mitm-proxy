const http = require("http");
const https = require("https");

module.exports = function(options, protocol, res) {
  return (/https/i.test(protocol) ? https : http).request(
    options,
    proxyRes => {
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      res.writeHead(proxyRes.statusCode);
      proxyRes.pipe(res);
    }
  );
};
