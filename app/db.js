export const namespace = 'db';

import DB from "file:D://workspace/github/nux_db/DB.js";
import {Client} from "https://deno.land/x/mysql/mod.ts";
import * as schemaSql from "../schema/sql.js";


export async function init(app){
    const connection = await new Client().connect(app.config.db);
    app.db = new DB(connection);
}

export const schema = {
    db:{}
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
