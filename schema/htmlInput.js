import {complete} from "./schema.js";
import {mixin} from "../util/js.js";
import {htmlInput} from "../html/input.js";

function toHtmlInputSchema(schema){
    console.log(schema);
    complete(schema);
    const attr = mixin(formatDefaults[schema.format]);

    console.log(schema.format);
    console.log(attr);

    if (schema.type === 'bool' && attr.type === undefined) attr.type = 'checkbox';
    const mappable = ['patter', 'required', 'name'];
    if (attr.type === 'number') mappable.push('min', 'max');
    for (var prop of mappable) {
        if (schema[prop] === undefined) continue;
        if (attr[prop] !== undefined) continue;
        attr[prop] = schema[prop];
    }
    if (schema.maxLength !== undefined && attr.maxlength === undefined) {
        attr.maxlength = schema.maxLength;
    }
    if (schema.multipleOf !== undefined && attr.steps === undefined) {
        attr.steps = schema.multipleOf;
    }
    schema.htmlInput && mixin(schema.htmlInput, attr);
    return attr;
}

export function tohtmlInput(schema, value){
    const attr = toHtmlInputSchema(schema);
    return htmlInput(attr, value);
}

const formatDefaults = {
    int8: {
        type:'number',
    },
    uint8: {
        type:'number',
    },
    int16: {
        type:'number',
    },
    uint16: {
        type:'number',
    },
    int32: {
        type:'number',
    },
    uint32: {
        type:'number',
    },
    float32: {
        type:'number',
    },
    float64: {
        type:'number',
    },
    'date-time': {
        type:'datetime-local',
    },
    date: {
        type:'date',
    },
    time: {
        type:'time',
    },
    email: {
        type:'email',
    },
    json: {
        type:'textarea',
    },
}