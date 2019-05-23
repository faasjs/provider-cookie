import Session from '../session';
import * as crypto from 'crypto';

describe('session', function () {
  const session = new Session({
    key: 'key',
    secret: crypto.randomBytes(128).toString('hex')
  });

  test('encode & decode', function () {
    const text = {
      user_id: 'user_id'
    }

    expect(session.decode(session.encode(text))).toEqual(text);
  });

  test('decode not valid', function () {
    expect(() => {
      session.decode(session.encode('text') + '1')
    }).toThrowError('Not valid');
  });

  test('no secret', function () {
    expect(() => {
      new Session({})
    }).toThrowError('Session key & secret required.');
  })
});
