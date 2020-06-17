
export class Csp {
    constructor(){
        this['child-src'] = {};
        this['connect-src'] = {};
        this['default-src'] = {};
        this['font-src'] = {};
        this['frame-src'] = {};
        this['img-src'] = {};
        this['manifest-src'] = {};
        this['media-src'] = {};
        this['object-src'] = {};
        this['prefetch-src'] = {};
        this['script-src'] = {};
        this['script-src-elem'] = {};
        this['script-src-attr'] = {};
        this['style-src'] = {};
        this['style-src-elem'] = {};
        this['style-src-attr'] = {};
        this['worker-src'] = {};
        this.report_uri = null;
    }
    toString(){
        if (this['default-src']["'none'"] && Object.entries(this['default-src']).length > 1) delete this['default-src']["'none'"];
        let str = '';
        for (let [type, allowed] of Object.entries(this)) {
            if (!allowed) continue;
            if (type ==='report_uri') continue;
            allowed = Object.entries(allowed).filter(entry=>entry[1]);
            if (!allowed.length) continue;
            str += type+' '+allowed.map(item=>item[0]).join(' ')+'; ';
        }
        if (this.report_uri) str += ' report-uri '+this.report_uri;
        return str;
    }
};