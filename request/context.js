import { Cookies2 } from "./cookies.js";
import { serializeParams } from "./serializeParams.js";
import { Csp } from "./csp.js";
//import Introspected from "https://raw.githubusercontent.com/nuxodin/introspected/master/esm/introspected.js";

const pool = new WeakMap();

export function getContext(denoRequest){
	if (pool.has(denoRequest)) return pool.get(denoRequest);
	const request = new Context(denoRequest);
	pool.set(denoRequest, request);
	return request;
}

class Context {
	constructor(serverRequest){
		this.in = new Request(serverRequest);
		this.out = new Response();
		this.cookies = new Cookies2(this.in, this.out);
	}
}

class Request {
	constructor(oRequest){
		this.ip = oRequest.conn.remoteAddr.hostname;

		// request-headers
		this.headers = oRequest.headers;

		/*
		this.header = Object.create(null);
		for (let header of oRequest.headers) {
			let name = header[0];
			let value = header[1];
			this.header[name] = value;
		}
		Object.freeze(this.header)
		*/

		// Url-object
		let protocol = 'http:'; // todo: where can i find the protocol? rel.proto is "HTTP/1.1"
		this.url = new URL(protocol + '//' + this.headers.get('host') + oRequest.url);
		this.__get = serializeParams(this.url.searchParams); // beta
	}
}

class Response {
	constructor(){
		this.body = null;
		this.headers = new Headers();
		this.csp = new Csp();
		this.cspReport = new Csp();
	}
	toServerResponse() {
		// body
		let body = this.body;
		// header
		let x = this.csp.toString();
		if (x) this.headers.append('Content-Security-Policy', x);
		x = this.cspReport.toString();
		if (x) this.headers.append('Content-Security-Policy-Report-Only', x);
		// response
		return {
			status: this.status || 200,
			body,
			headers: this.headers,
		};
	}
}
