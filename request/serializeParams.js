
export function serializeParams(items) {
	var object = Object.create(null);
	for (let item of items) {
		var name = item[0];
		var value = item[1];
		var matches = name.match(/(^[^\[]+|\[[^\]]*\])/g);
		var active = object;
		for (var i=0, match; match=matches[i++];) { // walk path (item[xy][])
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
