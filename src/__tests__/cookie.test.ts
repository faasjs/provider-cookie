import Cookie from '../cookie';
import Session from '../session';

describe('cookie', function () {
  describe('read', function () {
    test('should work', function () {
      const helpers = {
        _event: {
          header: {
            cookie: 'a=1; b=2'
          }
        }
      };
      const cookie = new Cookie({}, helpers);

      expect(cookie.read('a')).toEqual('1');
      expect(cookie.read('b')).toEqual('2');
    });

    test('no cookie', function () {
      const helpers = {
        _event: {
          header: {}
        }
      };
      const cookie = new Cookie({}, helpers);

      expect(cookie.read('a')).toEqual(null);
    });
  });

  describe('write', function () {
    test('base', function () {
      const headers = {};
      const helpers = {
        _event: {},
        http: {
          setHeader: function (key: string, value: any) {
            headers[key] = value;
          }
        }
      };
      const cookie = new Cookie({}, helpers);
      cookie.write('key', 'value');

      expect(headers).toEqual({ 'Set-Cookie': 'key=value;max-age=31536000;path=/;Secure;HttpOnly;' });
    });

    test('delete', function () {
      const headers = {};
      const helpers = {
        _event: {},
        http: {
          setHeader: function (key: string, value: any) {
            headers[key] = value;
          }
        }
      };
      const cookie = new Cookie({}, helpers);
      cookie.write('key', null);

      expect(headers).toEqual({ 'Set-Cookie': 'key=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;Secure;HttpOnly;' });
    });
  });

  test('domain', function () {
    const headers = {};
    const helpers = {
      _event: {},
      http: {
        setHeader: function (key: string, value: any) {
          headers[key] = value;
        }
      }
    };
    const cookie = new Cookie({
      domain: 'example.com'
    }, helpers);
    cookie.write('key', null);

    expect(headers).toEqual({ 'Set-Cookie': 'key=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;domain=example.com;Secure;HttpOnly;' });
  });

  test('no http', function () {
    const helpers = {
      _event: {}
    };
    const cookie = new Cookie({}, helpers);
    expect(() => {
      cookie.write('key', null);
    }).toThrowError('Not found trigger-http\'s helper')
  });

  test('session', function () {
    const helpers = {
      _event: {}
    };
    const cookie = new Cookie({
      session: {
        key: 'key',
        secret: 'secret'
      }
    }, helpers);

    expect(cookie.session).toBeInstanceOf(Session);
  });
});
