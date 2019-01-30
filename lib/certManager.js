const CertManager = require("node-easy-cert");
const colors = require('colors');
const certManager = new CertManager();

function getRootCa() {
  return new Promise((resolve, reject) => {
    const rootOptions = { commonName: "Light MITM Proxy" };
    certManager.generateRootCA(rootOptions, (err, keyPath, certPath) => {
      if (!err) {
        console.log(colors.blue('证书已生成，需要手动信任该证书'));
        console.log(colors.blue(certPath));
      } else if (err === 'ROOT_CA_EXISTED') {
        const path = certManager.getRootCAFilePath();
        console.log(colors.blue('证书已生成'));
        certManager.ifRootCATrusted((err, ifRootCATrusted) => {
          if (!ifRootCATrusted) {
            console.log(colors.blue('需要手动信任该证书'));
          } else {
            console.log(colors.blue('证书已被系统信任'));
          }
          console.log(colors.blue(path));
        });
      }
      resolve();
    });
  });
}

function getFakeHttpsServerCert() {
  return new Promise((resolve, reject) => {
    certManager.getCertificate("fake_https_server", (err, key, cert) => {
      // 根证书还没有生成
      if (err === "ROOT_CA_NOT_EXISTS") {
        return getRootCa();
      }
      if (!err) {
        resolve({
          key,
          cert
        });
      }
      reject();
    });
  });
}

certManager.getFakeHttpsServerCert = getFakeHttpsServerCert;
certManager.getRootCa = getRootCa;

module.exports = certManager;
