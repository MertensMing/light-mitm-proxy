const http = require("http");
const colors = require("colors");
const handler = require("./handler");

const { connectHandler, httpHandler } = handler;

module.exports = function startServer(port) {
  const server = new http.Server();

  server.listen(port, () => {
    console.log(colors.green(`中间人代理服务器启动成功，端口: ${port}`));
  });

  server.on("error", e => {
    if (e.code == "EADDRINUSE") {
      console.error("中间人代理启动失败");
      console.error(`端口：${port} 已被占用`);
    } else {
      console.error(e);
    }
  });

  // 代理 http 请求
  server.on("request", httpHandler);

  // https 的请求通过 http 隧道方式转发
  server.on("connect", connectHandler);
};
