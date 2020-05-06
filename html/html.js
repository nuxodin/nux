

export function documentFromObject(data) {
    let html =
    '<!DOCTYPE HTML>\n'+
    '<html '+objectToAttr({lang:data.lang})+'>\n'+
    '  <head>'+
    '    <meta charset="utf-8">\n'+
    '    <title>'+encode(data.title)+'</title>\n';
    for (let [name, value] of Object.entries(data.meta)) {
        if (!value) continue; // needed?
        html +=
        '    <meta '+objectToAttr({[name]:value})+'">\n';
    }
    for (let link of data.link) {
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
    for (let name in obj) {
        let value = obj[name];
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
                for (let option of options) {
                    let selected = value === options ? ' selected' : '';
                    if (selected !== '') oneSelected = true;
                    content += '<option' + (selected)+'>' + encode(option);
                }
            } else {
                for (let [key, value] of Object.entries(options)) {
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
