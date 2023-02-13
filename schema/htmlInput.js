import {complete} from "./schema.js";
import {mixin} from "../util/js.js";
import {input} from "../html/html.js";

function toHtmlInputSchema(schema){
    console.log(schema);
    complete(schema);
    const attr = mixin(formatDefaults[schema.format]);

    console.log(schema.format);
    console.log(attr);

    if (schema.type === 'bool' && attr.type === undefined) attr.type = 'checkbox';
    const mappable = ['patter', 'required', 'name'];
    if (attr.type === 'number') mappable.push('min', 'max');
    for (const prop of mappable) {
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
    return input(attr, value);
}

const formatDefaults = { // int/uint?? these are not json-schema formats..., or?
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