# express-middleware-fetch

## Fetch routes from other express middlewares

This creates a fetch function, partially compatible with browser fetch, which can be used to fetch routes from the same express server (e.g. routes generated by other middlewares)

## Available function

```typescript
expressMiddlewareFetch(req:express.Request):((url:string|URL,requestInit?:RequestInit)=>Promise<Response>)&{req:express.Request}
```

Call this function with an express.Request object to create a fetch function for the same express server as that express.Request object.

The 2nd argument is the same as what is usually passed into fetch.

The express.Request object can later be changed on the returned fetch function.

## Example

```typescript
import * as express from 'express';
import expressMiddlewareFetch from 'express-middleware-fetch';

let req:express.Request;
let req2:express.Request;

let fetcher=expressMiddlewareFetch(req);
fetcher('https://localhost/mypath');
fetcher.req=req2;
fetcher('https://localhost/mypath2');
```

## Building instructions

Delete the line ```"packageManager": "yarn@4.1.1",``` from package.json.
Delete the line ```yarnPath: .yarn/releases/yarn-4.1.1.cjs``` from .yarnrc.yml.

```bash
npm i -g yarn
yarn set version 4.1.1
yarn --immutable
yarn build
```