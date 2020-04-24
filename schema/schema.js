
export function transform(scheme, value) {
    const transform = scheme.transform;
    if (transform.trim) {
        switch (transform.trim){
            case 'left':  value = value.trimLeft(); break;
            case 'right': value = value.trimRight(); break;
            default:      value = value.trim();
        }
    }
    if (transform.case === 'upper')   value = value.toUpperCase();
    if (transform.case === 'lower')   value = value.toLowerCase();
    if (transform.case === 'ucfirst') value = value.charAt(0).toUpperCase() + value.slice(1);
    if (transform.case === 'lcfirst') value = value.charAt(0).toLowerCase() + value.slice(1);

    return value;
}

export function validate(schema, value){
    const string = value.toString(); // string representation
    //value = transform(scheme, value);
    if (!(schema.required) && value==='') return; // is this ok? if not required value can always be '' ???
    //if ((schema.pattern??0) && !preg_match('/'.schema.pattern.'/', value)) return 'Pattern does not match';
    if (schema.required && string==='') return 'required';
    console.log(schema.maxlength)
    if (schema.maxLength !== undefined && string.length > schema.maxLength) return 'maxLength';
    if (schema.format === 'email' && string.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/)) return 'format';
    if (schema.format === 'number') {
        value = parseFloat(value);
        if (schema.min !== undefined && value < schema.min) return 'min';
        if (schema.max||0 && value > schema.max) return 'max';
    }
    if (schema.format === 'date') {
        if (isset(schema.min) && strtotime(value) < strtotime(schema.min)) return 'Too small';
        if (isset(schema.max) && strtotime(value) < strtotime(schema.max)) return 'Too big';
    }
    if (schema.format === 'select') {
        $options = schema.options;
        $assoc = array_keys($options) !== range(0, count($options) - 1);
        if ($assoc  && !isset($options[value])) return 'Not in options';
        if (!$assoc && !in_array(value, $options)) return 'Not in options';
    }
}

export function complete(schema) {
    if (!schema.transform) schema.transform = {};
    //deepMixin(typeDefaults[schema.type], schema); // todo
    Object.assign(schema, typeDefaults[schema.type]);

    // format
    if (schema.format === 'email' && schema.transform.trim === undefined) {
        schema.transform.trim = true;
    }
    if (schema.format === 'email' && schema.transform.case === undefined) {
        schema.transform.case = 'lower';
    }
    if (!schema.htmlInput) schema.htmlInput = {};
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
        htmlInput: {type: 'text'},
        sql: {type:'text'},
    },
    bool: {
        htmlInput: {type: 'checkbox'},
        sql: {type:'text', length:1},
    },
}

export function hints(schema) {
    var hints = []
    if (schema.transform.case === 'ucfirst' && !schema.transform.trim) {
        hints.push('you want to add trim if you use ucfirst');
    }
    return hints;
}
