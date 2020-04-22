
function validate(schema, value){
      if (!(schema.required) && value==='') return; // is this ok? if not required value can always be '' ???
      //if ((schema.pattern??0) && !preg_match('/'.schema.pattern.'/', value)) return 'Pattern does not match';
      if (schema.required && value==='') return 'Required';
      if (schema.maxlength!==undefined && strlen(value) > schema.maxlength) return 'Too long';
      if (schema.type === 'email' && !filter_var(value, FILTER_VALIDATE_EMAIL)) return 'Email is not valid';
      if (schema.type === 'number') {
          value = parseFloat(value);
          if (schema.min !== undefined && value < schema.min) return 'Too small';
          if (schema.max||0 && value > schema.max) return 'Too big';
      }
      if (schema.type === 'date') {
          if (isset(schema.min) && strtotime(value) < strtotime(schema.min)) return 'Too small';
          if (isset(schema.max) && strtotime(value) < strtotime(schema.max)) return 'Too big';
      }
      if (schema.type === 'select') {
        $options = schema.options;
        $assoc = array_keys($options) !== range(0, count($options) - 1);
        if ($assoc  && !isset($options[value])) return 'Not in options';
        if (!$assoc && !in_array(value, $options)) return 'Not in options';
      }
}


function complete(schema) {
    //deepMixin(typeDefaults[schema.type], schema); // todo
    console.log(schema, typeDefaults[schema.type])
    Object.assign(schema, typeDefaults[schema.type]);
    console.log(schema)
    return;
    for (name in typeDefaults[schema.type]) {
        let value = typeDefaults[type];
        if (schema[name] === undefined ) schema[name] = value; // todo, make a copy of objects
    }
}

function htmlComplete(schema){
    const attr = schema.htmlInput
    if (attr.type === 'number') {
        if (schema.min !== undefined && attr.min === undefined) {
            attr.min = schema.min;
        }
        if (schema.max !== undefined && attr.max === undefined) {
            attr.max = schema.max;
        }
    }
    if (schema.maxLength !== undefined && attr.maxlength === undefined) {
        attr.maxlength = schema.maxLength;
    }
    if (schema.pattern !== undefined && attr.pattern === undefined) {
        attr.pattern = schema.pattern;
    }
}

function htmlInput(schema){

    complete(schema);
    htmlComplete(schema);

    const attr = schema.htmlInput ? Object.assign({}, schema.htmlInput) : {};
    console.log(attr)
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
    const htmAttr = [];
    for (let name in attr) {
        let value = attr[name];
        if (value === false) continue;
        if (value === true) {
            htmAttr.push(name);
        } else {
            // if (preg_match('/^[0-9a-z_-]+$/i', value)) { // todo: better regexp
            // 	$attris[] = $name.'='.value;
            // } else {
                htmAttr.push(name + '="' + hee(value) + '"');
            // }
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


const typeDefaults = {
    Int8: {
        min: 0,
        max:255,
        htmlInput: {type: 'number'},
        sql: {type:'tinyint'},
    },
    Uint8: {
        min: -128,
        max:127,
        htmlInput: {type: 'number'},
        sql: {type:'tinyint'},
    },
    Int16: {
        min: -32768,
        max:32767,
        htmlInput: {type: 'number'},
        sql: {type:'mediumint'},
    },
    Uint16: {
        min: 0,
        max:65535,
        htmlInput: {type: 'number'},
        sql: {type:'mediumint'},
    },
    Int32: {
        min: -2147483648,
        max:2147483647,
        htmlInput: {type: 'number'},
        sql: {type:'int'},
    },
    Uint32: {
        min: 0,
        max:4294967295,
        htmlInput: {type: 'number'},
        sql: {type:'int'},
    },
    Float32: {
        htmlInput: {type: 'number'},
        sql: {type:'float'},
    },
    Float64: {
        htmlInput: {type: 'number'},
        sql: {type:'double'},
    },
    string: {
        htmlInput: {type: 'input'},
        sql: {type:'text'},
    },
}



var x = htmlInput({
    type:'string',
    maxLength:33,
    pattern:'[0-9]+',
})
console.log(x)