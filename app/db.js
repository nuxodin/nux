import DB from "file:D://workspace/github/nux_db/DB.js";
import {Client} from "https://deno.land/x/mysql/mod.ts";
import * as schemaSql from "../schema/sql.js";

import { tohtmlInput } from "../schema/htmlInput.js";

export const namespace = 'db';

export async function init(app){
    const connection = await new Client().connect(app.config.db);
    app.db = new DB(connection);
}

export const schema = {
    db:{}
}

export async function prepare(app){
    for (let [table, schema] of Object.entries(app.schema.db.items)) {
        for (let [field, fieldSchema] of Object.entries(schema.items)) {

            if (table === 'sess') { // zzz
                try {
                    var sql = schemaSql.alterSql(table, field, fieldSchema);
                    await app.db.query(sql);
                } catch (e) {
                    var sql = schemaSql.createSql(table, field, fieldSchema);
                    await app.db.query(sql);
                }
            }

        }
    }
}
