import {hee} from "./html.js";

export function htmlInput(attr, value){
    if (value !== undefined) attr.value = value;
    if (attr.value === undefined || attr.value === null) attr.value = '';
    attr.value = attr.value.toString();

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