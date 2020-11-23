import { deleteCookie, setCookie, getCookies } from "https://deno.land/std@0.79.0/http/cookie.ts";

export class Cookies2 {
	constructor(request, response){
		this.request = request;
		this.response = response;
		this._newCookies = Object.create(null);
	}
	get oldCookies(){
		var cookies = getCookies(this.request);
		Object.defineProperty(this,'oldCookies',{value:cookies});
		return cookies;
	}
	get(name){
		return this._newCookies[name]!==undefined ? this._newCookies[name].value : this.oldCookies[name];
	}
	set(name, options){
		if (typeof options === 'number') options = options+'';
		if (typeof options === 'string') options = {value:options};
		if (options.value === undefined) console.warn('no cookie value! todo: delete?');
		options.name = name;
		this._newCookies[name] = options;
		setCookie(this.response, options);
	}
	delete(name){
		//if (this.oldCookies[name]) { // only if cookie was sent?
			this._newCookies[name] = undefined;
		//}
		this.oldCookies[name] = undefined;
		deleteCookie(this.response, name);
	}
	// toResponse(response) {
	// 	for (const name in this._newCookies) {
	// 		const cookie = this._newCookies[name];
	// 		if (cookie === undefined) {
	// 			deleteCookie(response, name);
	// 		} else {
	// 			setCookie(response, cookie);
	// 		}
	// 	}
	// }
}

/*
todo ?
export function CookieProxy(request, response){
	var target = new Cookies(request, response)
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