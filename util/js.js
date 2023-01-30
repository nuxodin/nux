
export function mixin(src, target, force, deep) {
    target = target || {};
    for (const k in src) {
        if (!src.hasOwnProperty(k)) continue;
        if (force || target[k] === undefined) {
            target[k] = src[k];
        }
        if (!deep) continue;
        if (typeof target[k] === 'string') continue;
        mixin(src[k], target[k], force, deep);
    }
    return target;
}


/**
* Wraps the Object in a Proxy to allow autovivification
* @param {object} variable - Object to autoviv
* @example
*   var obj = {};
*   autoviv(obj).x.y.z = {};
*   console.log(obj)
* @return {void}
*/

const autoviv = function(variable){
    return new Proxy(variable, {
        get: function(target, name) {
            if (name in target) {
                return target[name];
            } else {
                target[name] = Object.create(null);
                return autoviv(target[name])
            }
        }
    });
}
