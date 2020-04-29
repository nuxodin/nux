
export function mixin(src, target, force, deep) {
    target = target || {};
    for (let k in src) {
    	if (!src.hasOwnProperty(k)) continue;
        if (force || target[k] === undefined) {
            target[k] = src[k];
        }
		if (!deep) continue;
		if (typeof target[k] === 'string') continue;
        mixin(src[k], target[k], force, deep);
    }
    return target;
};
