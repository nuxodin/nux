
/**
 * parse get-params to look like php
 * @param {string[][]} items - get-params
 */

export function serializeParams(items) {
	const object = Object.create(null);
	for (const item of items) {
		const name = item[0];
		const value = item[1];
		const matches = name.match(/(^[^\[]+|\[[^\]]*\])/g);
		let active = object;
		for (let i=0, match; match=matches[i++];) { // walk path (item[xy][])
			if (i>1) match = match.replace(/(^\[|\]$)/g,'');
			if (matches.length === i) { // at the end
				if (Array.isArray(active)) active.push(value);
				else active[match] = value;
			} else if (!active[match]) {
				active[match] = matches[i] === '[]' ? [] : Object.create(null);
			}
			active = active[match];
			if (typeof active === 'string') break; // todo: ?asdf=11&asdf[3]=3 => overwrite the sting asdf
		}
	}
	return object;
}
