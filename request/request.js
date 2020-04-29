import { Cookies } from "./cookies.js";
import { serializeParams } from "./serializeParams.js";
import { Csp } from "./csp.js";
//import { Session } from "./session.js";
//import Introspected from "https://raw.githubusercontent.com/nuxodin/introspected/master/esm/introspected.js";

const requests = new WeakMap();

export function getNuxRequest(denoRequest){
	if (requests.has(denoRequest)) return requests.get(denoRequest);
	const request = new Request(denoRequest);
	requests.set(denoRequest, request);
	return request;
}

class Request {
	constructor(req){
		this.ip = req.conn.remoteAddr.hostname;

		// request-headers
		this.header = Object.create(null);
		for (let header of req.headers) {
			let name = header[0];
			let value = header[1];
			this.header[name] = value;
		}

		// Url-object
		let protocol = 'http:'; // todo: where can i find the protocol? rel.proto is "HTTP/1.1"
		this.URL = new URL(protocol + '//' + this.header.host + req.url);

		this.__get = serializeParams(this.URL.searchParams);

		this.url = req.url;
		this.request = req;
		this.response = {
			body: '',
			header:{},
			csp: new Csp(),
			csp_report: new Csp(),
		};
		this.cookie = new Cookies(this.request);
	}
	createResponse(){
		// body
		let body = this.response.body;
		//if (typeof body === 'string') body = new TextEncoder().encode(body);
		// header
		this.response.header['Content-Security-Policy-Report-Only'] = this.response.csp_report.toString();
		this.response.header['Content-Security-Policy'] = this.response.csp.toString();
		const headers = new Headers();
		for (const key in this.response.header) {
			let value = this.response.header[key];
			if (!value) continue;
			headers.set(key, value);
		}
		// response
		var response = {
			status: this.response.status || 200,
			body,
			headers
		};
		this.cookie.toResponse(response);
		return response;
	}
	respond(){
		const response = this.createResponse();
		this.request.respond(response);
		//this.sessionObject && this.sessionObject.save();
	}

	// async initSession(){
	// 	this.sessionObject = new Session(this);
	// 	await this.sessionObject.init();
	// 	this.sess = this.sessionObject.data;
	// }
}
