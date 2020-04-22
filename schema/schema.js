
function transform(scheme, value) {
    const transform = scheme.transform;
    if (transform.trim) {
        switch (transform.trim){
            case 'left':  value = value.trimLeft(); break;
            case 'right': value = value.trimRight(); break;
            default:      value = value.trim();
        }
    }
    if (transform.case === 'upper') value = value.toUpperCase();
    if (transform.case === 'lower') value = value.toLowercase();
    if (transform.case === 'ucfirst') throw('todo');
    if (transform.case === 'lcfirst') throw('todo');
    return value;
}

function validate(schema, value){
    value = transform(scheme, value);
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
    Object.assign(schema, typeDefaults[schema.type]);
    return;
    for (name in typeDefaults[schema.type]) {
        let value = typeDefaults[type];
        if (schema[name] === undefined ) schema[name] = value; // todo, make a copy of objects
    }
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
