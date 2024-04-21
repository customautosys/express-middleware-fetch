"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressMiddlewareFetch = void 0;
function expressMiddlewareFetch(req) {
    return (function (req) {
        let fetcher = Object.assign(function (url, requestInit) {
            if (url instanceof URL)
                url = url.toString();
            return new Promise(function (resolve, reject) {
                var _a, _b, _c;
                let req = Object.assign({}, this.req);
                let params = {
                    ip: '127.0.0.1',
                    method: ((_a = this.requestInit) === null || _a === void 0 ? void 0 : _a.method) || 'get',
                    body: ((_b = this.requestInit) === null || _b === void 0 ? void 0 : _b.body) || '',
                    url,
                    headers: {
                        remoteAddress: '127.0.0.1',
                        origin: '127.0.0.1',
                        'content-type': 'text/plain',
                        'transfer-encoding': 'identity'
                    },
                    connection: {}
                };
                if ((_c = this.requestInit) === null || _c === void 0 ? void 0 : _c.headers) {
                    if (Array.isArray(this.requestInit.headers))
                        this.requestInit.headers.forEach(header => params.headers[header[0]] = header[1]);
                    else if (this.requestInit.headers.get)
                        this.requestInit.headers.forEach((value, key) => params.headers[key] = value);
                    else
                        Object.assign(params.headers, this.requestInit.headers);
                }
                Object.assign(req, params);
                let headers = {};
                let status = 200;
                let res = {
                    _removedHeader: {},
                    _statusCode: 200,
                    statusMessage: 'OK',
                    get statusCode() {
                        return this._statusCode;
                    },
                    set statusCode(status) {
                        this._statusCode = status;
                        this.status(status);
                    },
                    set(x, y) {
                        if (x && typeof x === 'object') {
                            for (let key in x) {
                                res.setHeader(key, x[key]);
                            }
                        }
                        else {
                            res.setHeader(x, y !== null && y !== void 0 ? y : '');
                        }
                        return res;
                    },
                    header: null,
                    setHeader(x, y) {
                        headers[x] = y;
                        headers[x.toLowerCase()] = y;
                        return res;
                    },
                    getHeader(x) {
                        return headers[x];
                    },
                    redirect(code, url) {
                        if (typeof code !== 'number') {
                            status = 301;
                            url = code;
                        }
                        else {
                            status = code;
                        }
                        res.setHeader('Location', url);
                        res.end();
                    },
                    sendStatus(code) {
                        status = code;
                        return res;
                    },
                    status: null,
                    end(raw) {
                        return __awaiter(this, void 0, void 0, function* () {
                            var _a;
                            let parsed = null;
                            try {
                                parsed = JSON.parse(raw);
                            }
                            catch (error) {
                                console.log(error);
                            }
                            if ((parsed === null || parsed === void 0 ? void 0 : parsed.data) && typeof parsed.data === 'object') {
                                parsed.data = JSON.stringify(parsed.data);
                                if (!parsed.headers)
                                    parsed.headers = {};
                                parsed.headers['content-type'] = 'application/json';
                            }
                            if (!parsed)
                                parsed = {};
                            if (!parsed.status)
                                parsed.status = res.statusCode;
                            if (!parsed.statusText)
                                parsed.statusText = res.statusMessage;
                            if (!parsed.headers)
                                parsed.headers = headers;
                            let response = new Response((_a = parsed.data) !== null && _a !== void 0 ? _a : raw, parsed);
                            resolve(response);
                        });
                    },
                    send: null,
                    write: null
                };
                res.header = res.set;
                res.status = res.sendStatus;
                res.send = res.write = res.end;
                this.req.app(req, res, reject);
            }.bind({
                req: fetcher.req,
                url,
                requestInit
            }));
        }, { req });
        return fetcher;
    })(req);
}
exports.expressMiddlewareFetch = expressMiddlewareFetch;
;
exports.default = expressMiddlewareFetch;
