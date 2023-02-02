
export class Schema {
    addSchema(schema){
        const schemaObj = typeof schema === 'string'
            ? {
                promise:Deno.readFile(file).then(contents=>JSON.parse(contents)),
                source:file,
            }
            : {
                promise,
                source:'inline', // todo add stacktrace
            };
        this.schemas.unshift(schemaObj);
    }
    async prepair(){
        const promises = [];
        for (const schemaObj of this.schemas) {

            // load schema
            const promise = schemaObj.schema.then(schema=>{

                // collect ids
                const ids = findIds(schema);
                for (const id in ids) {
                    if (id in this.ids) console.warn('id '+id+' already defined');
                    const idObj = ids[id];
                    idObj.schemaObj = schemaObj;
                    //else this.id[id] = idObj; ???
                }

                schemaObj.schema = schema;
            });
            promises.push(promise);
        }
        const schemas = await Promise.all(promises);
    }

    validate(data, path=[]) {
        // holds props already validated my previous schema
        const validated = {};

        for (const schemaObj of this.schemas) {
            let schema = schemaObj.schema;

            // walk to the right path
            for (part of path) {
                if (part in schema) {
                    schema = schema[part];
                } else {
                    return;
                }
            }

            // check properties
            for (const prop in schema) {
                if (prop === '$ref') continue; // check at the end

                if (prop in validated) continue;
                validated[prop] = true;

                if (!(prop in validations)) continue;
                const ok = validations[prop](schema[prop], data);
                if (!ok) throw('schema validation fails '+prop+' in Schema: '+schemaObj.source);

            }
            if ('$ref' in schema) {
                //this.validateById(data, schema['$ref']) ??
            }
        }

        // check properties
        for (property in data.properties) {
            const pathClone = path.slice(0);
            pathClone.push(property);
            this.validate(data.properties[property], path);
        }

    }
}



const validations = {
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



const x = new Schema();
x.addSchema({type:'string'});
x.validate('test')


//console.log(JSON.stringify(x, null, 3));
