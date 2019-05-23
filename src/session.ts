import * as crypto from 'crypto';

interface SessionOption {
  key: string;
  secret: string;
  salt: string;
  signedSalt: string;
  keylen: number;
  iterations: number;
  digest: string;
  cipherName: string;
}

export default class Session {
  public opts: SessionOption;
  public secret: Buffer;
  public signedSecret: Buffer;

  constructor (opts: {
    key?: string;
    secret?: string;
    salt?: string;
    signedSalt?: string;
    keylen?: number;
    iterations?: number;
    digest?: string;
    cipherName?: string;
  }) {
    if (!opts.key || !opts.secret) {
      throw Error('Session key & secret required.');
    }

    this.opts = Object.assign({
      key: 'key',
      secret: crypto.randomBytes(128).toString('hex'),
      salt: 'salt',
      signedSalt: 'signedSalt',
      keylen: 64,
      iterations: 100,
      digest: 'sha256',
      cipherName: 'aes-256-cbc'
    }, opts);

    this.secret = crypto.pbkdf2Sync(this.opts.secret, this.opts.salt!, this.opts.iterations, this.opts.keylen / 2, this.opts.digest!);

    this.signedSecret = crypto.pbkdf2Sync(this.opts.secret, this.opts.signedSalt, this.opts.iterations!, this.opts.keylen, this.opts.digest);
  }

  encode (text: any) {
    if (typeof text !== 'string') {
      text = JSON.stringify(text);
    }

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.opts.cipherName, this.secret, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]).toString('base64');

    const main = Buffer.from([encrypted, iv.toString('base64')].join('--')).toString('base64');

    const hmac = crypto.createHmac(this.opts.digest, this.signedSecret);

    hmac.update(main);
    const digest = hmac.digest('hex');

    return main + '--' + digest;
  }

  decode (text: string) {
    text = decodeURIComponent(text);

    const signedParts = text.split('--');
    const hmac = crypto.createHmac(this.opts.digest, this.signedSecret);
    let digest;

    hmac.update(signedParts[0]);
    digest = hmac.digest('hex');

    if (signedParts[1] !== digest) {
      throw Error('Not valid');
    }

    const message = Buffer.from(signedParts[0], 'base64').toString();
    const parts = message.split('--').map(function (part) {
      return Buffer.from(part, 'base64');
    });

    const cipher = crypto.createDecipheriv(this.opts.cipherName, this.secret, parts[1]);
    const part = Buffer.from(cipher.update(parts[0])).toString('utf8');
    const final = cipher.final('utf8');

    let decryptor = [part, final].join('');

    if (decryptor.startsWith('{')) {
      decryptor = JSON.parse(decryptor);
    }

    return decryptor;
  }
}
