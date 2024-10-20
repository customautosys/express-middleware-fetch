import type * as express from 'express';
import {Readable} from 'readable-stream';
import jsan from 'jsan';
import qs from 'qs';

export function expressMiddlewareFetch(req:express.Request):{req:express.Request}&((url:string|URL,requestInit?:RequestInit)=>Promise<Response>){
	return(function(req:express.Request){
		let fetcher=Object.assign(function(url:string|URL,requestInit?:RequestInit){
			if(url instanceof URL)url=url.toString();
			return new Promise<Response>(function(
				this:{
					req:express.Request,
					path:string,
					requestInit:RequestInit
				},
				resolve:(response:Response)=>void,
				reject:(error:any)=>void
			){
				if(this.requestInit.headers){
					for(let i in this.requestInit.headers){
						let lowercase=i.toLowerCase();
						if(lowercase!==i)this.requestInit.headers[lowercase]=this.requestInit.headers[i];
					}
				}else{
					this.requestInit.headers={};
				}
				if(typeof this.requestInit.body==='string'&&this.requestInit.body&&String(this.requestInit.headers['content-type']).toLowerCase()==='application/json'){
					let body:any;
					try{
						body=jsan.parse(this.requestInit.body);
					}catch(error){}
					if(typeof body==='object'&&body)this.requestInit.body=body;
				}
				let req:any;
				let body:any=this.requestInit.body;
				if(String(this.requestInit.headers['content-type']).toLowerCase()==='application/json'&&typeof this.requestInit.body==='object'){
					body=jsan.stringify(this.requestInit.body);
				}/*else{*/
					let stream=new Readable();
					if(body)stream.push(body);
					req=Object.assign(stream,this.req);
				/*}*/
				let params:any={
					ip:'127.0.0.1',
					method:this.requestInit?.method||'get',
					body:this.requestInit?.body||'',
					url,
					headers:{
						remoteAddress:'127.0.0.1',
						origin:'127.0.0.1',
						'content-type':'text/plain',
						'transfer-encoding':'identity'
					},
					connection:{}
				};
				let queryIndex=url.indexOf('?');
				if(queryIndex>-1){
					params.query=qs.parse(url.substring(url.indexOf('?')+1));
				}
				if(this.requestInit.headers){
					if(Array.isArray(this.requestInit.headers))this.requestInit.headers.forEach(header=>params.headers[header[0]]=header[1]);
					else if((this.requestInit.headers as Headers).get)(this.requestInit.headers as Headers).forEach((value,key)=>params.headers[key]=value);
					else Object.assign(params.headers,this.requestInit.headers);
				}
				Object.assign(req,params);

				let headers={};
				let status=200;
				let res={
					_removedHeader:{},
					_statusCode:200,
					statusMessage:'OK',
					get statusCode(){
						return this._statusCode
					},
					set statusCode(status){
						this._statusCode = status
						this.status(status)
					},
					set(x:object|string,y:string){
						if(x&&typeof x==='object'){
							for(let key in x){
								res.setHeader(key,x[key]);
							}
						}else{
							res.setHeader(x as string,y??'');
						}
						return res;
					},
					header:null as typeof res['set']|null,
					setHeader(x:string,y:string){
						headers[x] = y;
						headers[x.toLowerCase()] = y;
						return res;
					},
					getHeader(x:string){
						return headers[x];
					},
					redirect(code:string|number,url:string){
						if(typeof code!=='number') {
							status=301;
							url=code;
						}else{
							status=code;
						}
						res.setHeader('Location',url);
						res.end();
					},
					sendStatus(code:number){
						status=code;
						return res;
					},
					status:null as typeof res['sendStatus']|null,
					async end(raw?:any){
						let parsed=null;
						try{
							parsed=JSON.parse(raw);
						}catch(error:any){
							console.log(error);
						}
						if(parsed?.data&&typeof parsed.data==='object'){
							parsed.data=JSON.stringify(parsed.data);
							if(!parsed.headers)parsed.headers={};
							parsed.headers['content-type']='application/json';
						}
						if(!parsed)parsed={};
						if(!parsed.status)parsed.status=res.statusCode;
						if(!parsed.statusText)parsed.statusText=res.statusMessage;
						if(!parsed.headers)parsed.headers=headers;
						let response=new Response(parsed.data??raw,parsed);
						resolve(response);
					},
					send:null as typeof res['end']|null,
					write:null as typeof res['end']|null
				};

				res.header=res.set;
				res.status=res.sendStatus;
				res.send=res.write=res.end;

				this.req.app(req,res as any,reject);
			}.bind({
				req:fetcher.req,
				url,
				requestInit:requestInit||{}
			}));
		},{req});
		return fetcher;
	})(req);
};

export default expressMiddlewareFetch;