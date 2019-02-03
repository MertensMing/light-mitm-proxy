const http = require("http");
const url = require("url");
const net = require("net");
const utils = require("./utils");
const requestRemote = require("./requestRemote");
const getFakeHttpsServerPort = require("./getFakeHttpsServerPort");

function httpHandler(req, res) {
  const protocol = !/^http:/.test(req.url) ? "https" : "http";
  const options = utils.getRequestOptions(req, protocol);

  const proxyReq = requestRemote(options, protocol, realRes => {
    Object.keys(realRes.headers).forEach(key => {
      res.setHeader(key, realRes.headers[key]);
    });
    res.writeHead(realRes.statusCode);
    realRes.pipe(res);
  });

  req.pipe(proxyReq);

  proxyReq.on("error", e => {
    console.error(e);
  });
}

function connectHandler(req, clientSocket, head) {
  const srvUrl = url.parse(`http://${req.url}`);

  console.log(`CONNECT ${srvUrl.hostname}:${srvUrl.port}`);

  getFakeHttpsServerPort().then(port => {
    const serverSocket = net.connect(
      // srvUrl.port,
      // srvUrl.hostname,
      port,
      "127.0.0.1",
      () => {
        clientSocket.write(
          "HTTP/1.1 200 Connection Established\r\n" +
            "Proxy-agent: Light-MITM-Proxy\r\n" +
            "\r\n"
        );
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
      }
    );

    serverSocket.on("error", e => {
      console.error(e);
    });
  });
}

module.exports = { httpHandler, connectHandler };
