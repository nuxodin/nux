import {complete} from "./schema.js";

function htmlComplete(schema){
    const ud = undefined;

    if (!schema.htmlInput) schema.htmlInput = {};
    const attr = schema.htmlInput
    if (schema.type === 'bool' && attr.type === ud) attr.type = 'checkbox';
    const mappable = ['patter', 'required', 'name'];

    if (attr.type === 'number') mappable.push('min', 'max');
    for (var prop of mappable) {
        if (schema[prop] === ud) continue;
        if (attr[prop] !== ud) continue;
        attr[prop] = schema[prop];
    }

    if (schema.maxLength !== ud && attr.maxlength === ud) {
        attr.maxlength = schema.maxLength;
    }
    if (schema.multipleOf !== ud && attr.steps === ud) {
        attr.steps = schema.multipleOf;
    }
}

export function htmlInput(schema, value){
    complete(schema);
    htmlComplete(schema);

    const attr = schema.htmlInput ? Object.assign({}, schema.htmlInput) : {};

    attr.value = value === undefined ? '' : value;

    let tag = attr.tag || 'input';
    let close = false;
    let content = '';
    switch (attr.type) {
        case 'textarea':
            tag = 'textarea';
            close = true;
            content = hee(attr.value);
            delete attr.value;
            delete attr.type;
            break;
        case 'select':
            tag = 'select';
            close = true;
            const options = schema.options;
            let oneSelected = false;
            if (Array.isArray(options)) {
                for (let option of options) {
                    let selected = value === options ? ' selected' : '';
                    if (selected !== '') oneSelected = true;
                    content += '<option' + (selected)+'>' + hee(option);
                }
            } else {
                for (let [key, value] of Object.entries(options)) {
                    let selected = value === options ? ' selected' : '';
                    if (selected !== '') oneSelected = true;
                    content += '<option' + (selected)+' value="' + hee(key) + '">' + hee(option);
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
            attr.value = str_replace(' ','T',attr.value);
            attr.value = preg_replace('/:00$/', '', attr.value);
            attr.value = attr.value.replace(' ', 'T');
            attr.value = attr.value.replace(/:00$/, '');
            break;

    }
    if (attr.value==='') delete attr.value;

    const htmAttr = [];
    for (let name in attr) {
        let value = attr[name];
        if (value === false) continue;
        if (value === true) {
            htmAttr.push(name);
        } else {
            if (value !== '' && value.length < 100 && !value.match(/[\s"'=<>`]/)) { // is this the task of a minimizer?
                htmAttr.push(name + '=' + value);
            } else {
                htmAttr.push(name + '="' + hee(value) + '"');
            }
        }
    }
    if (content) close = true;
    return '<' + tag + ' ' + htmAttr.join(' ') +  '>' + (content ? content : '') + (close ? '</' + tag + '>':'');
}

function hee(str){
    return (str+'').replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
        return '&#'+i.charCodeAt(0)+';';
    });
}

/*
var x = htmlInput({
    type:'string',
    maxLength:33,
    pattern:'[0-9]+',
})
console.log(x)
*/