import { readFileSync, writeFileSync } from 'fs';
import { createSign } from 'crypto';

const privateKeyBase64 = process.env.LICENSE_PRIVATE_KEY;
if (!privateKeyBase64) {
  console.error('缺少 LICENSE_PRIVATE_KEY');
  process.exit(1);
}

const privateKeyPem =
  '-----BEGIN PRIVATE KEY-----\n' +
  Buffer.from(privateKeyBase64, 'base64').toString('base64')
    .match(/.{1,64}/g).join('\n') +
  '\n-----END PRIVATE KEY-----\n';

const data = readFileSync('licenses.json');
const sign = createSign('RSA-SHA256');
sign.update(data);
sign.end();

writeFileSync('licenses.json.sig', sign.sign(privateKeyPem).toString('base64'));
console.log('签名完成');
