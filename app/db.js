export const namespace = 'db';

//import DB from "file:D://workspace/github/nux_db/DB.js";
import DB from "../../nux_db/DB.js";
import {Client} from "https://deno.land/x/mysql/mod.ts";
import * as schemaSql from "../schema/sql.js";


export async function init(app){
    const connection = await new Client().connect(app.config.db);
    app.db = new DB(connection);
}


export async function prepare(app){
    const dbSchema = app.schema.db;

    schemaSql.completeDbScheme(dbSchema);
    for (let [table, schema] of Object.entries(dbSchema.properties)) {
        await app.db.query("CREATE TABLE IF NOT EXISTS `"+table+"` (`_tmp` tinyint NOT NULL default '0')");
        var primaries = [];
        for (let [field, fieldSchema] of Object.entries(schema.properties)) {
            try {
                var sql = schemaSql.alterSql(table, field, fieldSchema);
                await app.db.query(sql);
            } catch (e) {
                console.log(e.message)
                try {
                    var sql = schemaSql.createSql(table, field, fieldSchema);
                    await app.db.query(sql);
                } catch (e) {
                    console.log(sql)
                    console.log(e);
                }
            }
            if (fieldSchema.colIndex === 'primary') primaries.push(field);
        }
        if (primaries.length) {
            await app.db.table(table).setPrimaries(primaries);
        }
    }
}


export const schema = {
    settings:{
        properties:{
            db:{
                properties:{
                    handler: {
                        enum:['mysql', 'postgrees', 'sqlite'],
                        required:true
                    },
                    host: {
                        default:'localhost'
                    },
                    username: {
                        type:'string'
                    },
                    password: {
                        type:'string'
                    },
                    database: {
                        type:'string'
                    },
                }
            }
        }
    },
    db:{
        $defs:{
            int8: {
                type:'integer',
                minimum: 0,
                maximum: 255,
                multipleOf:1,
            },
            uint8: {
                type:'integer',
                minimum: -128,
                maximum: 127,
                multipleOf:1,
            },
            int16: {
                type:'integer',
                minimum: -32768,
                maximum: 32767,
                multipleOf:1,
            },
            uint16: {
                type:'integer',
                minimum: 0,
                maximum: 65535,
                multipleOf:1,
            },
            int32: {
                type:'integer',
                minimum: -2147483648,
                maximum: 2147483647,
                multipleOf:1,
            },
            uint32: {
                type:'integer',
                minimum: 0,
                maximum: 4294967295,
                multipleOf:1,
            },
            float32: {
                type:'number',
            },
            float64: {
                type:'number',
            },
            colAutoincrement: {
                $ref: '#db/$defs/uint32'
            },
        }
    },
};
