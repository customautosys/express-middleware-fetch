import type * as express from 'express';
export declare function expressMiddlewareFetch(req: express.Request): {
    req: express.Request;
} & ((url: string | URL, requestInit?: RequestInit) => Promise<Response>);
export default expressMiddlewareFetch;
