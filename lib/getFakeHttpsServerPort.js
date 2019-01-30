const tls = require("tls");
const https = require("https");
const certManager = require("./certManager");
const utils = require("./utils");
const requestRemote = require("./requestRemote");

let port;
let fakeServer;

function getFakeHttpsServerPort() {
  return new Promise(resolve => {
    if (port) {
      resolve(port);
    }

    certManager.getFakeHttpsServerCert().then(res => {
      const { key, cert } = res;
      fakeServer = new https.Server({
        key,
        cert,
        SNICallback: (hostname, cb) => {
          certManager.getCertificate(
            hostname,
            (err, keyContent, crtContent) => {
              if (!err) {
                cb(
                  null,
                  tls.createSecureContext({
                    key: keyContent,
                    cert: crtContent
                  })
                );
              }
            }
          );
        }
      });

      fakeServer.listen(0, () => {
        port = fakeServer.address().port;
        resolve(port);
      });

      fakeServer.on("request", (req, res) => {
        const protocol = !/^http:/.test(req.url) ? "https" : "http";
        const options = utils.getRequestOptions(req, protocol);
        const proxyReq = requestRemote(options, protocol, res);
        req.pipe(proxyReq);
        proxyReq.on("error", e => {
          console.error(e);
        });
      });

      fakeServer.on("error", e => {
        console.error(e);
      });
    });
  });
}

module.exports = getFakeHttpsServerPort;
