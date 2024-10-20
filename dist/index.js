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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressMiddlewareFetch = void 0;
const readable_stream_1 = require("readable-stream");
const jsan_1 = __importDefault(require("jsan"));
const qs_1 = __importDefault(require("qs"));
function expressMiddlewareFetch(req) {
    return (function (req) {
        let fetcher = Object.assign(function (url, requestInit) {
            if (url instanceof URL)
                url = url.toString();
            return new Promise(function (resolve, reject) {
                var _a, _b;
                if (this.requestInit.headers) {
                    for (let i in this.requestInit.headers) {
                        let lowercase = i.toLowerCase();
                        if (lowercase !== i)
                            this.requestInit.headers[lowercase] = this.requestInit.headers[i];
                    }
                }
                else {
                    this.requestInit.headers = {};
                }
                if (typeof this.requestInit.body === 'string' && this.requestInit.body && String(this.requestInit.headers['content-type']).toLowerCase() === 'application/json') {
                    let body;
                    try {
                        body = jsan_1.default.parse(this.requestInit.body);
                    }
                    catch (error) { }
                    if (typeof body === 'object' && body)
                        this.requestInit.body = body;
                }
                let req;
                let body = this.requestInit.body;
                if (String(this.requestInit.headers['content-type']).toLowerCase() === 'application/json' && typeof this.requestInit.body === 'object') {
                    body = jsan_1.default.stringify(this.requestInit.body);
                } /*else{*/
                let stream = new readable_stream_1.Readable();
                if (body)
                    stream.push(body);
                req = Object.assign(stream, this.req);
                /*}*/
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
                let queryIndex = url.indexOf('?');
                if (queryIndex > -1) {
                    params.query = qs_1.default.parse(url.substring(url.indexOf('?') + 1));
                }
                if (this.requestInit.headers) {
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
                requestInit: requestInit || {}
            }));
        }, { req });
        return fetcher;
    })(req);
}
exports.expressMiddlewareFetch = expressMiddlewareFetch;
;
exports.default = expressMiddlewareFetch;
