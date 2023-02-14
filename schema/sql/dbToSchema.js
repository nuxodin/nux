
const indexTranslate = {
    PRI: 'primariy',
    UNI: 'unique',
    MUL: true,
}
const typeTranslate = {
    'tinyint':'int8',
    'smallint':'int16',
    'int':'int32',
    'bigint':'int64',
    'varchar':'string',
    'text':'string',
    'tinytext':'string',
}
export async function schemaFromDb(db) {
    const all = await db.query("SELECT * FROM information_schema.`TABLES` WHERE TABLE_SCHEMA = '"+db.conn.config.db+"' ");
    const schema = {
        properties:{},
        name:db.conn.config.db,
    };
    for (const dbTable of all) {
        const tableSchema = schema.properties[dbTable.TABLE_NAME] = {};
        tableSchema.properties = {};
        tableSchema.name = dbTable.TABLE_NAME;
        tableSchema.defaults = {
            charset: dbTable.TABLE_COLLATION.replace(/_.+/,''),
        };

        const fields = await db.query("SELECT * FROM information_schema.COLUMNS WHERE table_schema = '"+db.conn.config.db+"' AND table_name = '"+dbTable.TABLE_NAME+"' ORDER BY ORDINAL_POSITION");
        tableSchema.properties = {};
        for (const dbField of fields) {
            tableSchema.properties[dbField.COLUMN_NAME] = information_schema_columns_entry_to_schema(dbField);
        }
    }
    return schema;
}

function information_schema_columns_entry_to_schema(dbField) {
    const unsigned = dbField.COLUMN_TYPE.match(/ unsigned/,'') ? 'u':'';
    let type = unsigned+typeTranslate[ dbField.DATA_TYPE ];
    type = type[0].toUpperCase() + type.slice(1);
    const length = parseInt(dbField.CHARACTER_MAXIMUM_LENGTH);
    return {
        name:     dbField.COLUMN_NAME,
        type,
        length,
        required: dbField.IS_NULLABLE === 'NO' ? true: false,
        index:    indexTranslate[dbField.COLUMN_KEY],
        default:  dbField.COLUMN_DEFAULT,
        extra:    dbField.EXTRA,
        charset:  dbField.CHARACTER_SET_NAME,
    }
}
