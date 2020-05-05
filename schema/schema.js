import { mixin } from '../util/js.js';

export class Schema {
    constructor(schema){
        for (let i in schema) this[i] = schema[i];
    }
    transform (value) {
        for (let [prop, descriptor] of Object.entries(properties)) {
            if (!descriptor.transform) continue; // property does not transform value
            const propValue = this[prop];
            if (propValue === undefined) continue; // property not set
            var newValue = descriptor.transform(propValue, value);
            if (newValue !== undefined) value = newValue;
        }
        const error = this.error(value);
        if (error) throw Error(error);
        return value;
    }
    *errors (value){
        for (let prop in properties) {
            const descriptor = properties[prop];
            if (!descriptor.validate) continue;
            const propValue = this[prop];
            if (propValue === undefined) continue; // property not set
            if (!descriptor.validate(propValue, value)) {
                yield `"${value}" does not match ${prop}:${propValue}`;
            }
        }
    }
    error(value) {
        for (let error of this.errors(value)) return error;
        return false;
    }
    validate(value) {
        return !this.error(value);
    }
    schemaError(){
        let lastError = false
        for (let prop in properties) {
            const descriptor = properties[prop];
            if (!descriptor.schemaError) continue;
            let propValue = this[prop];
            if (propValue === undefined) continue; // property not set
            const error = descriptor.schemaError(propValue, this);
            if (error) {
                lastError = `schema error: ${prop}:"${propValue}" with error:`+error;
                console.warn(error);
            }
        }
        return lastError;
    }
    toJSON(){
        const obj = {};
        for (let i in this) obj[i] = this[i];
        return obj;
    }
}


const properties = {
    title:{},
    description:{},
    default:{
        schemaError: (def, schema) => schema.error(def),
        todo_transform: (def, value) => {
            if (value === null || value) return def;
        },
    },
    examples:{ // useful for autocomplete?
        schemaError: (exampels, schema) => exampels.filter(item => schema.error(item)),
    },
    enum: {
        validate: (allowed, value) => allowed.includes(value),
        schemaError: (allowed, schema) => allowed.filter(item => schema.error(item)),
    },
    type:{
        transform(propValue, value) {
            if (propValue === 'string' && typeof value !== 'string' && value.toString) return value.toString();
            if (propValue === 'number' && typeof value !== 'number') return parseFloat(value);
            if (propValue === 'integer' && !Number.isInteger(value)) return parseInt(value);
            if (propValue === 'boolean' && typeof value !== 'boolean') return !!value;
        },
        validate(propValue, value) {
            if (propValue === 'object'  && typeof value === 'object') return true;
            if (propValue === 'integer' && Number.isInteger(value)) return true;
            if (propValue === 'number'  && typeof value === 'number' && isFinite(value)) return true;
            if (propValue === 'boolean' && typeof value === 'boolean') return true;
            if (propValue === 'string'  && typeof value === 'string') return true;
        },
        options: {
            string: {
            },
            number: {
                defaults: {
                    format:'float32',
                }
            },
            integer: {
                defaults: {
                    format:'int32'
                }
            },
            boolean: {},
            object: {},
            array: {},
        }
    },
    format: {
        options: {
            int8: {
                defaults: {
                    type:'integer',
                    min: 0,
                    max:255,
                    multipleOf:1,
                }
            },
            uint8: {
                defaults: {
                    type:'integer',
                    min: -128,
                    max:127,
                    multipleOf:1,
                },
            },
            int16: {
                defaults: {
                    type:'integer',
                    min: -32768,
                    max:32767,
                    multipleOf:1,
                },
            },
            uint16: {
                defaults: {
                    type:'integer',
                    min: 0,
                    max:65535,
                    multipleOf:1,
                },
            },
            int32: {
                defaults: {
                    type:'integer',
                    min: -2147483648,
                    max:2147483647,
                    multipleOf:1,
                },
            },
            uint32: {
                defaults: {
                    type:'integer',
                    min: 0,
                    max:4294967295,
                    multipleOf:1,
                },
            },
            float32: {
                defaults: {
                    type:'number',
                },
            },
            float64: {
                defaults: {
                    type:'number',
                },
            },
            'date-time': {
                defaults: {
                    type:'string',
                },
            },
            date: {
                defaults: {
                    type:'string',
                },
            },
            time: {
                defaults: {
                    type:'string',
                },
            },
            email: {
                defaults: {
                    type:'string',
                    length: 120,
                    transformTrim: true,
                    transformCase: 'lower',
                },
            },
        },
    },
    min:{
        type:'integer',
        validate: (min, value) => value >= min,
    },
    max:{
        type:'integer',
        validate: (max, value) => value <= max,
    },
    minLength:{
        type:'integer',
        validate: (minLen, value) => value.length >= minLen,
    },
    maxLength:{
        type:'integer',
        validate: (maxLen, value) => value.length <= maxLen,
    },
    multipleOf:{
        type:'number',
        validate: (propValue, value) => value % propValue === 0,
    },
    pattern:{
        validate: (pattern, value) => {
            try { return new RegExp(pattern).test(value); } catch { return true; }
        },
        schemaError: (pattern)=>{
            try { RegExp(pattern).test('test'); } catch (e) { return e.message; }
        }
    },

    /* custom */
    transformTrim:{
        transform(propValue, value){
            switch (propValue){
                case 'left':  return value.trimLeft();
                case 'right': return value.trimRight();
                default:      return value.trim();
            }
        }
    },
    transformCase:{
        transform(propValue, value){
            if (propValue === 'upper') return value.toUpperCase();
            if (propValue === 'lower') return value.toLowerCase();
        }
    },
    transformCaseFirst:{
        transform(propValue, value){
            if (propValue === 'upper') return value.charAt(0).toUpperCase() + value.slice(1);
            if (propValue === 'lower') return value.charAt(0).toLowerCase() + value.slice(1);
        }
    },
    colAutoincrement:{
        options: {
            [true]: {
                defaults: {
                    format:'uint32',
                    colIndex:'primary',
                }
            },
            [false]: {}
        }
    },
    colIndex:{
        options: {
            [true]: {},
            'unique': {},
            'primary': {},
        }
    },
}

// A hell of a lot of code not to cause reqursion, is that easier?
const tmpValsMap = new WeakMap();


for (let requestedProp in properties) {
    Object.defineProperty(Schema.prototype, requestedProp, {
        get(){
            // prevent reqursion: save getter requested values temporary
            if (!tmpValsMap.has(this)) {
                var startedHere = true;
                tmpValsMap.set(this, {});
            }
            var tmpVals = tmpValsMap.get(this);
            if (requestedProp in tmpVals) {
                return tmpVals[requestedProp];
            }
            tmpVals[requestedProp] = undefined; // if it has a value it will set it later

            // get defaults
            // todo: first loop own properties then all?
            for (let otherProp in this) { // loop other properties (getter)
                if (requestedProp === otherProp) continue; // requested Property
                const options = properties[otherProp]?.options;
                if (!options) continue;
                const otherPropValue = this[otherProp];
                if (otherPropValue === undefined) continue;
                const val = options[otherPropValue]?.defaults?.[requestedProp];

                tmpVals[requestedProp] = val; // prevent reqursion

                if (val !== undefined) {
                    if (startedHere) tmpValsMap.delete(this); // prevent reqursion
                    return val;
                }
            }
            if (startedHere) tmpValsMap.delete(this); // prevent reqursion
        },
        set(value){
            if (properties[requestedProp].options) {
                if (!properties[requestedProp].options[value]) {
                    console.warn('warning: "'+value+'" is not allowed as "'+requestedProp)+'"';
                }
            }
            Object.defineProperty(this, requestedProp, {
                value,
                configurable:true,
                enumerable:true,
            })
        },
        configurable:true,
        enumerable:true,
    });
}





const formatDefaults = {
    int8: {
        type:'integer',
        min: 0,
        max:255,
        multipleOf:1,
    },
    uint8: {
        type:'integer',
        min: -128,
        max:127,
        multipleOf:1,
    },
    int16: {
        type:'integer',
        min: -32768,
        max:32767,
        multipleOf:1,
    },
    uint16: {
        type:'integer',
        min: 0,
        max:65535,
        multipleOf:1,
    },
    int32: {
        type:'integer',
        min: -2147483648,
        max:2147483647,
        multipleOf:1,
    },
    uint32: {
        type:'integer',
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
        transformTrim: true,
        transformCase: 'lower',
        transform:{trim:true, case:'lower'}
    },
    json: {
        type:'string',
    },
}


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
    //mixin(typeDefaults[schema.type], schema, false, true);
    if (!schema.htmlInput) schema.htmlInput = {};
    return schema;
}

const typeDefaults = {
    bool: {
        htmlInput: {type: 'checkbox'},
        sql: {type:'varchar', length:1},
    },
}



export function hints(schema) {
    var hints = []
    if (schema.transform.caseFirst && !schema.transform.trim) {
        hints.push('you want to add trim if you use caseFirst');
    }
    return hints;
}
