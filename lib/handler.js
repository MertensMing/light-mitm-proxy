const http = require("http");
const url = require("url");
const net = require("net");
const utils = require("./utils");
const requestRemote = require("./requestRemote");
const getFakeHttpsServerPort = require("./getFakeHttpsServerPort");

function httpHandler(req, res) {
  const protocol = !/^http:/.test(req.url) ? "https" : "http";
  const options = utils.getRequestOptions(req, protocol);
  const proxyReq = requestRemote(options, protocol, res);
  req.pipe(proxyReq);
  proxyReq.on("error", e => {
    console.error(e);
  });
}

function connectHandler(req, cltSocket, head) {
  var srvUrl = url.parse(`http://${req.url}`);
  console.log(`CONNECT ${srvUrl.hostname}:${srvUrl.port}`);
  getFakeHttpsServerPort().then(port => {
    const srvSocket = net.connect(
      // srvUrl.port,
      // srvUrl.hostname,
      port,
      "127.0.0.1",
      () => {
        cltSocket.write(
          "HTTP/1.1 200 Connection Established\r\n" +
            "Proxy-agent: Light-MITM-Proxy\r\n" +
            "\r\n"
        );
        srvSocket.write(head);
        srvSocket.pipe(cltSocket);
        cltSocket.pipe(srvSocket);
      }
    );
    srvSocket.on("error", e => {
      console.error(e);
    });
  });
}

module.exports = { httpHandler, connectHandler };
