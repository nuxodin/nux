import { mixin } from '../util/js.js';

export class Schema {
    constructor(schema, parent){
        define(this, '$parent', parent);
        define(this, '$root', parent ? parent.$root : this);
        if (this.$root === this) define(this, '$ids', { '#':this });

        for (const i in schema) {
            const child = schema[i];
            if (Array.isArray(child))  { // how to handle arrays?
                this[i] = new Schema(child, this);
            } else if (typeof child == 'object')  { // how to handle arrays?
                this[i] = new Schema(child, this);
            } else {
                this[i] = child;
            }
            if (child?.$id) {
                const ids = this.$root.$ids;
                const id = '#'+child.$id;
                if (ids[id] !== undefined) console.warn(id+' already declared');
                ids[id] = child;
            }
        }
        // mixin "$refs" when the schema is built
        for (const i in this) {
            const child = this[i];
            if (child?.$ref) {
                const ref = findRef(child, child.$ref);
                //Object.setPrototypeOf(child, ref);
                mixin(ref, child, false, true);
                delete child['$id'];
            }
        }
    }
    $validate(data){
        for (const i in validate) {
            if (i in this) {
                validate[i](this[i], data);
            }
        }
    }
    // toJSON() { // use if $refs as prototype
    //     const obj = {};
    //     for (let i in this) {
    //         obj[i] = this[i].toJson ? this[i].toJson() : this[i];
    //     }
    //     return obj;
    // }
}

const validate = {
    type: (types, data)=>{
        const hasOne = toArray(types).filter(type => {
            return (typeof data) === type;
        });
        return hasOne.lenght;
    },
    minimum: (min, value)=>{
        return !isNumber(value) || value >= min;
    },
    maximum: (max, value)=>{
        return !isNumber(value) || value <= max;
    }
}

function findRef(startSchema, ref){
    let active = startSchema;
    for (const part of ref.split('/'))  {
        if (part[0]==='#') {
            active = startSchema.$root.$ids[part];
            if (active === undefined) console.warn('$ref not found '+ref+' at: '+part);
        } else {
            if (active[part] === undefined) console.warn('$ref not found '+ref+' at: '+part)
            active = active[part];
        }
    }
    return active;
}

function define(obj, name, value){
    Object.defineProperty(obj, name, {
        enumerable: false,
        configurable: false,
        value:value
    });
}


//let x = new Schema(example);
//console.log(JSON.stringify(x, null, 3));
