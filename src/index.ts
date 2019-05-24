import Cookie from './cookie';
import Flow from '@faasjs/flow';

export function handler (opts: {
  config: {
    session?: {
      key: string;
      secret: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}, flow: Flow) {
  return new Cookie(opts.config, flow.helpers);
}
