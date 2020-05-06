import { delCookie, setCookie, getCookies } from "https://deno.land/std@v0.42.0/http/cookie.ts";

export class Cookies2 {
	constructor(request, response){
		this.request = request;
		this.response = response;
		this.newCookies = Object.create(null);
	}
	get oldCookies(){
		var cookies = getCookies(this.request);
		Object.defineProperty(this,'oldCookies',{value:cookies});
		return cookies;
	}
	get(name){
		return this.newCookies[name]!==undefined ? this.newCookies[name].value : this.oldCookies[name];
	}
	set(name, options){
		if (typeof options === 'number') options = options+'';
		if (typeof options === 'string') options = {value:options};
		if (options.value === undefined) console.warn('no cookie value! todo: delete?');
		options.name = name;
		this.newCookies[name] = options;
		setCookie(this.response, options);
	}
	delete(name){
		//if (this.oldCookies[name]) { // only if cookie was sent?
			this.newCookies[name] = undefined;
		//}
		this.oldCookies[name] = undefined;
		delCookie(this.response, name);
	}
	// toResponse(response) {
	// 	for (const name in this.newCookies) {
	// 		const cookie = this.newCookies[name];
	// 		if (cookie === undefined) {
	// 			delCookie(response, name);
	// 		} else {
	// 			setCookie(response, cookie);
	// 		}
	// 	}
	// }
}

/*
todo:
export function CookieProxy(request){
	var proxy = new Cookies(request)
	return new Proxy(target, {
		set(obj, prop, value){
			if (value === null || value === undefined) {
				return obje.delete(prop);
			}
			return obj.set(prop, value);
		}
		get(obj, prop){
			return obj.obj(prop, value);
		}
	})
}
*/

export class Cookies {
	constructor(request){
		this.request = request;
		this.newCookies = Object.create(null);
	}
	get oldCookies(){
		var cookies = getCookies(this.request);
		Object.defineProperty(this,'oldCookies',{value:cookies});
		return cookies;
	}
	get(name){
		return this.newCookies[name]!==undefined ? this.newCookies[name].value : this.oldCookies[name];
	}
	set(name, options){
		if (typeof options === 'number') options = options+'';
		if (typeof options === 'string') options = {value:options};
		if (options.value === undefined) console.warn('no cookie value! todo: delete?');
		options.name = name;
		this.newCookies[name] = options;
	}
	delete(name){
		//if (this.oldCookies[name]) { // only if cookie was sent
			this.newCookies[name] = undefined;
		//}
		this.oldCookies[name] = undefined;
	}
	toResponse(response) {
		for (const name in this.newCookies) {
			const cookie = this.newCookies[name];
			if (cookie === undefined) {
				delCookie(response, name);
			} else {
				setCookie(response, cookie);
			}
		}
	}
}
