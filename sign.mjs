import { readFileSync, writeFileSync, existsSync } from 'fs';
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

// 需要签名的清单：licenses.json（授权）和 fba.json（FBA 费用）
const targets = ['licenses.json', 'fba.json'];

for (const file of targets) {
  if (!existsSync(file)) {
    console.log(`跳过（文件不存在）：${file}`);
    continue;
  }

  const data = readFileSync(file);
  const sign = createSign('RSA-SHA256');
  sign.update(data);
  sign.end();

  writeFileSync(`${file}.sig`, sign.sign(privateKeyPem).toString('base64'));
  console.log(`签名完成：${file} -> ${file}.sig`);
}
