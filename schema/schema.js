import { mixin } from '../util/js.js';

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
    if (transform.caseFirst === 'upper') value = value.charAt(0).toUpperCase() + value.slice(1);
    if (transform.caseFirst === 'lower') value = value.charAt(0).toLowerCase() + value.slice(1);
    return value;
}

export function enforce(schema, value) {
    value = transform(schema, value);
    if (schema.charset === 'ascii') value = value.replace(/[^\x00-\x7F]*/g, '');
    if (schema.maxLength !== undefined && value.length > schema.maxLength) value.substr(0, schema.maxLength);
    return value;
}

export function validate(schema, value){
    const string = value.toString(); // string representation
    //value = transform(scheme, value);
    if (!(schema.required) && value==='') return; // is this ok? if not required value can always be '' ???
    //if ((schema.pattern??0) && !preg_match('/'.schema.pattern.'/', value)) return 'Pattern does not match';
    if (schema.required && string==='') return 'required';
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
    //if (schema.charset === 'ascii' && !value.match(/[\x00-\x7F]*/)) return 'charset ascii';
}

export function complete(schema) {
    if (!schema.transform) schema.transform = {};

    mixin(formatDefaults[schema.format], schema, false, true);
    mixin(typeDefaults[schema.type], schema, false, true);

    // format
    if (schema.format === 'email' && schema.transform.trim === undefined) {
        schema.transform.trim = true;
    }
    if (schema.format === 'email' && schema.transform.case === undefined) {
        schema.transform.case = 'lower';
    }
    if (!schema.htmlInput) schema.htmlInput = {};
    return schema;
}

const typeDefaults = {
    bool: {
        htmlInput: {type: 'checkbox'},
        sql: {type:'text', length:1},
    },
}
const formatDefaults = {
    int8: {
        type:'number',
        min: 0,
        max:255,
        multipleOf:1,
    },
    uint8: {
        type:'number',
        min: -128,
        max:127,
        multipleOf:1,
    },
    int16: {
        type:'number',
        min: -32768,
        max:32767,
        multipleOf:1,
    },
    uint16: {
        type:'number',
        min: 0,
        max:65535,
        multipleOf:1,
    },
    int32: {
        type:'number',
        min: -2147483648,
        max:2147483647,
        multipleOf:1,
    },
    uint32: {
        type:'number',
        min: 0,
        max:4294967295,
        multipleOf:1,
    },
    float32: {
        type:'number',
    },
    float64: {
        type:'number',
    },
    'date-time': {
        type:'string',
    },
    date: {
        type:'string',
    },
    time: {
        type:'string',
    },
    email: {
        type:'string',
        length: 120,
        transform:{trim:true}
    },
    json: {
        type:'string',
    },
}



export function hints(schema) {
    var hints = []
    if (schema.transform.caseFirst && !schema.transform.trim) {
        hints.push('you want to add trim if you use caseFirst');
    }
    return hints;
}
