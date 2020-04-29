import * as Schema from "./schema.js";
import { mixin } from "../util/js.js";


/*
{
    format: 'Uint16',
    type: 'number',
    required: true,
    slq: {
        charset: 'utf8',
        $parent: {
            table:'usr',
            field:'id',
            onDelete:'cascade',
            onCopy:'cascade',
        }
    }
}
*/

const types = {
    CHAR:      {hasLength:true,  isDate:false, isString:true,  isNumber:false},
    VARCHAR:   {hasLength:true,  isDate:false, isString:true,  isNumber:false},
    TEXT:      {hasLength:false, isDate:false, isString:true,  isNumber:false},
    TINYTEXT:  {hasLength:false, isDate:false, isString:true,  isNumber:false},
    MEDIUMTEXT:{hasLength:false, isDate:false, isString:true,  isNumber:false},
    LONGTEXT:  {hasLength:false, isDate:false, isString:true,  isNumber:false},
    BLOB:      {hasLength:true,  isDate:false, isString:true,  isNumber:false},
    TINYBLOB:  {hasLength:true,  isDate:false, isString:true,  isNumber:false},
    MEDIUMBLOB:{hasLength:true,  isDate:false, isString:true,  isNumber:false},
    LONGBLOB:  {hasLength:true,  isDate:false, isString:true,  isNumber:false},
    ENUM:      {hasLength:false, isDate:false, isString:true,  isNumber:false},
    SET:       {hasLength:false, isDate:false, isString:true,  isNumber:false},
    BINARY:    {hasLength:true,  isDate:false, isString:true,  isNumber:false},
    VARBINARY: {hasLength:true,  isDate:false, isString:true,  isNumber:false},
    TINYINT:   {hasLength:true,  isDate:false, isString:false, isNumber:true},
    SMALLINT:  {hasLength:true,  isDate:false, isString:false, isNumber:true},
    MEDIUMINT: {hasLength:true,  isDate:false, isString:false, isNumber:true},
    INT:       {hasLength:true,  isDate:false, isString:false, isNumber:true},
    BIGINT:    {hasLength:true,  isDate:false, isString:false, isNumber:true},
    FLOAT:     {hasLength:false, isDate:false, isString:false, isNumber:true},
    DOUBLE:    {hasLength:true,  isDate:false, isString:false, isNumber:true},
    DECIMAL:   {hasLength:true,  isDate:false, isString:false, isNumber:true},
    DATE:      {hasLength:false, isDate:true,  isString:false, isNumber:false},
    DATETIME:  {hasLength:false, isDate:true,  isString:false, isNumber:false},
    TIMESTAMP: {hasLength:true,  isDate:true,  isString:false, isNumber:false},
    TIME:      {hasLength:true,  isDate:false, isString:false, isNumber:false},
    YEAR:      {hasLength:true,  isDate:false, isString:false, isNumber:false},
    BOOL:      {hasLength:true,  isDate:false, isString:false, isNumber:false},
}
const specials = ['','BINARY','UNSIGNED','UNSIGNED ZEROFILL','ON UPDATE CURRENT_TIMESTAMP'];
const defaultKeys = {'NULL':1, 'CURRENT_TIMESTAMP':1, 'CURRENT_TIMESTAMP()':1, 'NOW()':1, 'LOCALTIME':1, 'LOCALTIME()':1, 'LOCALTIMESTAMP':1, 'LOCALTIMESTAMP()':1};



function fieldSchemaToData(schema){
    Schema.complete(schema);

    var data = mixin(formatDefaults[schema.format]);
    mixin({special:'', type:'varchar'}, data);

    switch (schema.type) {
        case 'date':
            data.type = 'datetime';
            break;
    }
    switch (schema.charset) {
        case 'ascii':
            data.collate = 'ascii_general_ci';
            //utf8mb4_german2_ci
            break;
        default:
            data.collate = 'utf8mb4_general_ci';
            break;
    }
    if (schema.maxLength !== undefined) {
        data.length = schema.maxLength;
    }
    if (schema.required !== undefined) {
        data.null = !schema.required;
    }
    if (schema.$autoincrement !== undefined) {
        data.autoincrement = schema.$autoincrement;
        data.null = !schema.required;
    }
    schema.sql && mixin(schema.sql, data, true);
    return data;
}
export function to_column_definition(schema) {
    const data = fieldSchemaToData(schema);
    data.type    = data.type.toUpperCase();
    data.special = data.special.toUpperCase();
    if (!types[data.type]) throw('field type "' + data.special + +'" not allowed');
    if (!specials.includes(data.special)) throw('field special "' + data.special + +'" not allowed');
    if (data.special === 'UNSIGNED') {
        if (!data.type.endsWith('INT')) data.special = '';
    }


    // length
    let lengthStr = data.length ? '('+data.length+')' : '';
    if (!types[data.type].hasLength) lengthStr = '';
    if (data.type === 'VARCHAR' && !lengthStr) lengthStr = '(191)';
    if (data.type === 'DECIMAL' && data.length > 65) lengthStr = '(12,8)';
    // default
    let defaultStr = '';
    if (data.autoincrement) {
        defaultStr = 'AUTO_INCREMENT';
    } else if (data.default !== undefined) {
        defaultStr = "DEFAULT " + (defaultKeys[data.default] !== undefined ? data.default : '"'+escapeString(data.default)+'"');
    }

    // colate
    let collateStr = '';
    if (types[data.type].isNumber || types[data.type].isDate) data.collate = false;
    if (data.collate) {
        let characterSet = data.collate.split('_')[0];
        collateStr = "CHARACTER SET " + characterSet + " COLLATE " + data.collate + " ";
    }
    // null
    const nullStr = (data.null ? 'NULL' : 'NOT NULL');

    return data.type + lengthStr + " " + data.special + " " + collateStr + " " + nullStr + " " + defaultStr;
}

export function alterSql(table, field, schema) {
    return "ALTER TABLE `" + table + "` CHANGE `" + field + "` `" + field + "` " + to_column_definition(schema);
}
export function createSql(table, field, schema) {
    return "ALTER TABLE `" + table + "` ADD `" + field + "` " + to_column_definition(schema);
}


function escapeString(str) {
    return str.replace(/"/g, '\\"'); // todo, how secure is this?
}



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
    var all = await db.query("SELECT * FROM information_schema.`TABLES` WHERE TABLE_SCHEMA = '"+db.conn.config.db+"' ");
    let schema = {
        items:{},
        name:db.conn.config.db,
    };
    for (let dbTable of all) {
        let tableSchema = schema.items[dbTable.TABLE_NAME] = {};
        tableSchema.items = {};
        tableSchema.name = dbTable.TABLE_NAME;
        tableSchema.defaults = {
            charset: dbTable.TABLE_COLLATION.replace(/_.+/,''),
        };

        let fields = await db.query("SELECT * FROM information_schema.COLUMNS WHERE table_schema = '"+db.conn.config.db+"' AND table_name = '"+dbTable.TABLE_NAME+"' ORDER BY ORDINAL_POSITION");
        tableSchema.items = {};
        for (let dbField of fields) {
            tableSchema.items[dbField.COLUMN_NAME] = information_schema_columns_entry_to_schema(dbField);
        }
    }
    return schema;
}

function information_schema_columns_entry_to_schema(dbField) {
    let unsigned = dbField.COLUMN_TYPE.match(/ unsigned/,'') ? 'u':'';
    let type = unsigned+typeTranslate[ dbField.DATA_TYPE ];
    type = type[0].toUpperCase() + type.slice(1);
    let length = parseInt(dbField.CHARACTER_MAXIMUM_LENGTH);
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





const formatDefaults = {
    int8: {
        type:'tinyint',
    },
    uint8: {
        type:'tinyint',
        special:'unsigned',
    },
    int16: {
        type:'mediumint',
    },
    uint16: {
        type:'mediumint',
        special:'unsigned',
    },
    int32: {
        type:'int',
    },
    uint32: {
        type:'int',
        special:'unsigned',
    },
    int64: {
        type:'bigint',
    },
    uint64: {
        type:'bigint',
        special:'unsigned',
    },
    float32: {
        type:'float',
    },
    float64: {
        type:'double',
    },
    'date-time': {
        type:'datetime',
    },
    date: {
        type:'date',
    },
    time: {
        type:'time',
    },
    email: {
        type:'varchar',
        length: 120,
    },
    json: {
        type:'text',
    },
}