
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


function to_column_definition(schema) {
    const data = schema.sql;
    let {
        type          = 'varchar',
        length        = false,
        special       = '',
        collate       = false,
        $null         = false,
        autoincrement = false,
        $default      = false,
    } = data;
    type    = trim(strtoupper(type));
    special = trim(strtoupper(special));
    if (!types[type]) throw('field special "' + special + +'" not allowed');
    if (!special.includes(special)) throw('field special "' + special + +'" not allowed');
    // length
    length = length ? '('+length+')' : '';
    if (!types[type].hasLength) length = '';
    if (type === 'VARCHAR' && !length) length = '(191)';
    if (type === 'DECIMAL' && length > 65) length = '(12,8)';
    // default
    defaultStr = '';
    if (autoincrement) {
        defaultStr = 'AUTO_INCREMENT';
    } else if ($default !== false) {
        defaultStr = "DEFAULT " + (defaultKeys[$default] !== undefined) ? $default : '"'+escapeString($default)+'"';
    }
    // colate
    let collateStr = '';
    if (types[type].isNumber || types[type].isDate) collate = false;
    if (collate) {
        let characterSet = collate.split('_')[0];
        collateStr = "CHARACTER SET " + characterSet + " COLLATE " + collate + " ";
    }
    // null
    const nullStr = ($null ? 'NULL' : 'NOT NULL');

    return data.type + length + " " + special + " " + collateStr + " " + nullStr + " " + defaultStr;
}

function alertSql(table, field, schema) {
    return "ALTER TABLE `" + table + "` CHANGE `" + field + "` `" + field + "` " + to_column_definition(schema);
}

function escapeString(str) {
    return str.replace(/"/g, '\\"'); // todo, how secure is this?
}