import Session from './session';

export default class Cookie {
  public domain?: string;
  public path: string;
  public expires: number;
  public secure: boolean;
  public httpOnly: boolean;
  public session?: Session;
  private helpers: {
    _event: any;
    [key: string]: any;
  };

  constructor (opts: {
    domain?: string;
    path?: string;
    expires?: number;
    secure?: boolean;
    httpOnly?: boolean;
    session?: {
      key: string;
      secret: string;
      [key: string]: any;
    };
    [key: string]: any;
  }, helpers: any) {
    this.domain = opts.domain;
    this.path = opts.path || '/';
    this.expires = opts.expires || 31536000;
    this.secure = typeof opts.secure !== 'undefined' ? opts.secure : true;
    this.httpOnly = typeof opts.httpOnly !== 'undefined' ? opts.httpOnly : true;

    if (opts.session) {
      this.session = new Session(opts.session);
    }

    this.helpers = helpers;
  }

  public read (key: string) {
    if (!this.helpers._event.header.cookie) {
      return null;
    }

    const v = this.helpers._event.header.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)');

    return v ? decodeURIComponent(v.pop()) : null;
  }

  public write (key: string, value: any, opts?: {
    domain?: string;
    path?: string;
    expires?: number | string;
    secure?: boolean;
    httpOnly?: boolean;
  }) {
    opts = Object.assign({
      domain: this.domain,
      path: this.path,
      expires: this.expires,
      secure: this.secure,
      httpOnly: this.httpOnly
    }, opts || {});

    let cookie: string;
    if (value === null || typeof value === 'undefined') {
      opts.expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
      cookie = `${key}=;`;
    } else {
      cookie = `${key}=${encodeURIComponent(value)};`;
    }

    if (typeof opts.expires === 'number') {
      cookie += `max-age=${opts.expires};`;
    } else if (typeof opts.expires === 'string') {
      cookie += `expires=${opts.expires};`;
    }

    cookie += `path=${opts.path || '/'};`;

    if (opts.domain) {
      cookie += `domain=${opts.domain};`;
    }

    if (opts.secure) {
      cookie += 'Secure;';
    }

    if (opts.httpOnly) {
      cookie += 'HttpOnly;';
    }

    if (this.helpers.http && this.helpers.http.setHeader) {
      this.helpers.http.setHeader('Set-Cookie', cookie);
    } else {
      throw Error('Not found trigger-http\'s helper');
    }

    return this;
  }
}
