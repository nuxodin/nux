

export function documentFromObject(data) {
    let html =
    '<!DOCTYPE HTML>\n'+
    '<html '+objectToAttr({lang:data.lang})+'>\n'+
    '  <head>'+
    '    <meta charset="utf-8">\n'+
    '    <title>'+encode(data.title)+'</title>\n';
    for (const [name, value] of Object.entries(data.meta)) {
        if (!value) continue; // needed?
        html +=
        '    <meta '+objectToAttr({[name]:value})+'">\n';
    }
    for (const link of data.link) {
        html +=
        '    <link '+objectToAttr(link)+'>\n';
    }
    if (data.js_data) {
        html += '    <script type=json/c1>'+encode(JSON.stringify(data.js_data))+'</script>\n';
    }
    html +=
    '  <body>\n'+data.body;
    return html;
}

export function objectToAttr(obj) {
    const htmAttr = [];
    for (const name in obj) {
        const value = obj[name];
        if (value === false) continue;
        if (value === true) {
            htmAttr.push(name);
        } else {
            if (value !== '' && value.length < 100 && !value.match(/[\s"'=<>`]/)) { // is this the task of a minimizer?
                htmAttr.push(name + '=' + value);
            } else {
                htmAttr.push(name + '="' + attrEncode(value) + '"');
            }
        }
    }
    return htmAttr.join(' ');
}

export function input(attr){
    if (attr.value === undefined || attr.value === null) attr.value = '';
    attr.value = attr.value.toString();
    let tag = 'input';
    let content=null;
    switch (attr.type) {
        case 'textarea':
            tag = 'textarea';
            content = encode(attr.value);
            delete attr.value;
            delete attr.type;
            break;
        case 'select':
            tag = 'select';
            const options = schema.options;
            let oneSelected = false;
            if (Array.isArray(options)) {
                for (const option of options) {
                    let selected = value === options ? ' selected' : '';
                    if (selected !== '') oneSelected = true;
                    content += '<option' + (selected)+'>' + encode(option);
                }
            } else {
                for (const [key, value] of Object.entries(options)) {
                    let selected = value === options ? ' selected' : '';
                    if (selected !== '') oneSelected = true;
                    content += '<option' + (selected) + ' value="' + hee(key) + '">' + hee(option);
                }
            }
            if (!oneSelected && attr.value === undefined) { // actual value not in options
                content += '<option selected>' + hee(attr.value);
            }
            delete attr.value;
            delete attr.type;
            delete attr.options;
            break;
        case 'checkbox':
            attr.checked = attr.value ? true : false;
            attr.value = '1'; // new ok?
            break;
        case 'datetime-local':
            attr.value = attr.value.replace(' ', 'T');
            attr.value = attr.value.replace(/:00$/, '');
            break;
    }
    if (attr.value==='') delete attr.value;
    return '<' + tag + ' ' + objectToAttr(attr) +  '>' + (content !== null ? content + '</' + tag + '>' : '');
}


export function encode(str){ // ttodo: does not escape " and '
    return (str+'').replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
        return '&#'+i.charCodeAt(0)+';';
    });
}
export function attrEncode(str){
    return (str+'').replace(/[\u00A0-\u9999<>\&"']/gim, function(i) {
        return '&#'+i.charCodeAt(0)+';';
    });
}


export function hee(str){
    console.log('hee is deprecated use encode');
    return encode(str);
}

export function dump(obj, maxLevel=5) {
    const style =
    '<style>' +
    '.nuxHtmlDump{' +
    '   background:#f8f8f8;' +
    '   width:max-content;' +
    '   font-size:12px;' +
    '   color:black;' +
    '   padding:4px;' +
    '   border:1px solid;' +
    '}' +
    '.nuxHtmlDump table {' +
    '   border-collapse:collapse;' +
    '   display:inline-table;' +
    '}' +
    '.nuxHtmlDump table:target {' +
    '   background:#ff0;' +
    '}' +
    '.nuxHtmlDump td {' +
    '   vertical-align:top;' +
    '   padding:1px 4px;' +
    '   border:1px solid #0004;' +
    '}' +
    '.nuxHtmlDump number , .nuxHtmlDump bool { color:green; }' +
    '.nuxHtmlDump string { color:#800; }' +
    '.nuxHtmlDump null { color:#888; }' +
    '.nuxHtmlDump function { color:#88f; }' +
    '.nuxHtmlDump symbol { color:#f48; }' +
    '.nuxHtmlDump thead {' +
    '   font-weight:bold;' +
    '}' +
    '</style>';

    const objects = new WeakMap();

    return '<div class=nuxHtmlDump>' + style + valueToHtml(obj, 0) + '</div>';



    function valueToHtml(obj, level) {
        ++level;
        if (level > maxLevel) return '...';
        switch (typeof obj) {
            case 'string': return '<string>"'+obj+'"<string>';
            case 'number': return '<number>'+obj+'<number>';
            case 'boolean': return '<bool>'+obj+'<bool>';
            case 'function': return '<function>function '+obj.name+'<function>';
            case 'symbol': return '<symbol>'+obj.toString()+'<symbol>';
            default:
                if (obj === null || obj === undefined) return '<null>'+obj+'<null>';
                if (obj instanceof Date) return '<date>'+obj+'<date>';
                if (Array.isArray(obj)) {
                    return '[' + obj.map(item => valueToHtml(item, level)).join(' , ') + ']';
                }

                if (objects.has(obj)) {
                    return '<a href="#'+objects.get(obj)+'">(circular)</a>';
                }

                const id = ('x'+Math.random()).replace('.','');
                try {
                    objects.set(obj, id);
                } catch {
                    return '? error ?';
                }

                // table
                const cols = objectIsTable(obj);
                if (cols) {
                    let str = '<table id="'+id+'">';
                    str += '<thead>';
                    str += '<tr>';
                    str += '<td> ';
                    for (const col in cols) {
                        str += '<td>'+ encode(col);
                    }
                    str += '<tbody>';
                    for (const [name, value] of Object.entries(obj)) {
                        str += '<tr>';
                        str += '<td>'+ encode(name);
                        for (const col in cols) {
                            str += '<td>'+ valueToHtml(value[col], level);
                        }
                    }
                    return str += '</table>';
                }

                // object
                let str = '<table id="'+id+'">';
                for (const [name, value] of Object.entries(obj)) {
                    str += '<tr>';
                    str += '<td>'+encode(name);
                    str += '<td>'+valueToHtml(value, level);
                }
                return str += '</table>';
        }
    }

    function objectIsTable(obj) {
        const keys = {}; // cols
        let numProps = 0;
        for (const prop in obj) {
            ++numProps;
            for (const key in obj[prop]) {
                if (keys[key] === undefined) keys[key] = 0;
                keys[key]++;
            }
        }
        if (numProps < 3) return; // just two rows
        if (Object.values(keys).length < 2) return; // not enough cols
        for (const keyNum of Object.values(keys)) {
            if (keyNum < numProps/2) { // not minimum half the keys in sub obj
                return;
            }
        }
        return keys;
    }
}
