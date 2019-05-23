import Cookie from './cookie';
import Flow from '@faasjs/flow';

export default function (opts: {
  resource: {
    config: {
      session?: {
        key: string;
        secret: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}, flow: Flow) {
  const object = Object.create(null);

  object.cookie = new Cookie(opts.resource.config, flow.helpers);

  return object;
}
