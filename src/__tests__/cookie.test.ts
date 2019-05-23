import Cookie from '../cookie';
import Session from '../session';

describe('cookie', function () {
  describe('read', function () {
    test('should work', function () {
      const cookie = new Cookie({}, {
        _event: {
          header: {
            cookie: 'a=1; b=2'
          }
        }
      });

      expect(cookie.read('a')).toEqual('1');
      expect(cookie.read('b')).toEqual('2');
    });

    test('no cookie', function () {
      const cookie = new Cookie({}, {
        _event: {
          header: {}
        }
      });

      expect(cookie.read('a')).toBeUndefined();
    });
  });

  describe('write', function () {
    test('base', function () {
      const headers = {};
      const cookie = new Cookie({}, {
        _event: {},
        http: {
          setHeader: function (key: string, value: any) {
            headers[key] = value;
          }
        }
      });
      cookie.write('key', 'value');

      expect(headers).toEqual({ 'Set-Cookie': 'key=value;max-age=31536000;path=/;Secure;HttpOnly;' });
    });

    test('delete', function () {
      const headers = {};
      const cookie = new Cookie({}, {
        _event: {},
        http: {
          setHeader: function (key: string, value: any) {
            headers[key] = value;
          }
        }
      });
      cookie.write('key', null);

      expect(headers).toEqual({ 'Set-Cookie': 'key=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;Secure;HttpOnly;' });
    });
  });

  test('domain', function () {
    const headers = {};
    const cookie = new Cookie({
      domain: 'example.com'
    }, {
        _event: {},
        http: {
          setHeader: function (key: string, value: any) {
            headers[key] = value;
          }
        }
      });
    cookie.write('key', null);

    expect(headers).toEqual({ 'Set-Cookie': 'key=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;domain=example.com;Secure;HttpOnly;' });
  });

  test('no http', function () {
    const cookie = new Cookie({}, {
      _event: {}
    });
    expect(() => {
      cookie.write('key', null);
    }).toThrowError('Not found trigger-http\'s helper')
  });

  describe('session', function () {
    test('session', function () {
      const cookie = new Cookie({
        session: {
          key: 'key',
          secret: 'secret'
        }
      }, {
          _event: {}
        });

      expect(cookie.session._).toBeInstanceOf(Session);
    });

    describe('read', function () {
      test('return value', function () {
        const cookie = new Cookie({
          session: {
            key: 'key',
            secret: 'secret'
          }
        }, {
            _event: {
              header: {
                cookie: 'key=YUwxU1dBMDc5anlDemY3SHhPSDhHUT09LS1BdGJTSzdHSzhsRGJCcDlMZ05lK0ZnPT0=--6a5edb5edffc49259127b2268a82061f8937b742f541df6ccb283b5ca0e312d6;'
              }
            },
            _context: {
              current: {
                id: 'id'
              }
            }
          });

        expect(cookie.session.read('key')).toEqual('value');
      });

      test('undefined', function () {
        const cookie = new Cookie({
          session: {
            key: 'key',
            secret: 'secret'
          }
        }, {
            _event: {
              header: {}
            },
            _context: {
              current: {
                id: 'id'
              }
            }
          });

        expect(cookie.session.read('key')).toBeUndefined();
      });
    });

    describe('write', function () {
      test('add', function () {
        const headers = {};
        const cookie = new Cookie({
          session: {
            key: 'key',
            secret: 'secret'
          }
        }, {
            _event: {
              header: {}
            },
            _context: {
              current: {
                id: 'id'
              }
            },
            http: {
              setHeader: function (key: string, value: string) {
                headers[key] = value;
              }
            }
          });

        cookie.session.write('key', 'value');
        expect(cookie.session._.decode(headers['Set-Cookie'].match('(^|;)\\s*key\\s*=\\s*([^;]+)')[2])).toEqual({ key: 'value' })
      });

      test('delete', function () {
        const headers = {};
        const cookie = new Cookie({
          session: {
            key: 'key',
            secret: 'secret'
          }
        }, {
            _event: {
              header: {
                cookie: 'key=YUwxU1dBMDc5anlDemY3SHhPSDhHUT09LS1BdGJTSzdHSzhsRGJCcDlMZ05lK0ZnPT0=--6a5edb5edffc49259127b2268a82061f8937b742f541df6ccb283b5ca0e312d6;'
              }
            },
            _context: {
              current: {
                id: 'id'
              }
            },
            http: {
              setHeader: function (key: string, value: string) {
                headers[key] = value;
              }
            }
          });
        cookie.session.write('key', null);

        expect(cookie.session.read('key')).toBeUndefined();
        expect(cookie.session._.decode(headers['Set-Cookie'].match('(^|;)\\s*key\\s*=\\s*([^;]+)')[2])).toEqual({})
      });

      test('multi change', function () {
        const headers = {};
        const cookie = new Cookie({
          session: {
            key: 'key',
            secret: 'secret'
          }
        }, {
            _event: {
              header: {}
            },
            _context: {
              current: {
                id: 'id'
              }
            },
            http: {
              setHeader: function (key: string, value: string) {
                headers[key] = value;
              }
            }
          });

        cookie.session.write('a', 1);
        cookie.session.write('a', 2);
        cookie.session.write('b', 1);
        expect(cookie.session._.decode(headers['Set-Cookie'].match('(^|;)\\s*key\\s*=\\s*([^;]+)')[2])).toEqual({ a: 2, b: 1 })
      });
    });
  });
});
