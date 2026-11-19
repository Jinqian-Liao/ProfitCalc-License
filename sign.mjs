import { readFileSync, writeFileSync } from 'fs';
import { createSign } from 'crypto';

const privateKeyBase64 = process.env.LICENSE_PRIVATE_KEY;
if (!privateKeyBase64) {
  console.error('缺少 LICENSE_PRIVATE_KEY');
  process.exit(1);
}

// PowerShell 的 ExportRSAPrivateKey 导出的是 PKCS#1 格式
// 对应的 PEM 头尾是 BEGIN RSA PRIVATE KEY
const privateKeyPem =
  '-----BEGIN RSA PRIVATE KEY-----\n' +
  privateKeyBase64.match(/.{1,64}/g).join('\n') +
  '\n-----END RSA PRIVATE KEY-----\n';

const data = readFileSync('licenses.json');
const sign = createSign('RSA-SHA256');
sign.update(data);
sign.end();

writeFileSync('licenses.json.sig', sign.sign(privateKeyPem).toString('base64'));
console.log('签名完成');
