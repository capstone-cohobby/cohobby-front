declare module 'sockjs-client' {
  interface SockJSOptions {
    server?: string;
    transports?: string | string[];
    sessionId?: number | (() => number);
    timeout?: number;
    devel?: boolean;
    debug?: boolean;
    protocol_whitelist?: string[];
    rtt?: number;
    prefix?: string;
    headers?: { [key: string]: string };
  }

  interface SockJS extends EventTarget {
    readyState: number;
    protocol: string;
    url: string;
    onopen: ((event: Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onclose: ((event: CloseEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    send(data: string): void;
    close(code?: number, reason?: string): void;
  }

  interface SockJSConstructor {
    new (url: string, protocols?: string | string[] | null, options?: SockJSOptions): SockJS;
    (url: string, protocols?: string | string[] | null, options?: SockJSOptions): SockJS;
    readonly CONNECTING: number;
    readonly OPEN: number;
    readonly CLOSING: number;
    readonly CLOSED: number;
  }

  const SockJS: SockJSConstructor;
  export default SockJS;
  export = SockJS;
}

