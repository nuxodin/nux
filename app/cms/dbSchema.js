export var db = {properties:{
    page:{properties:{
        id:{ colAutoincrement:true },
        log_id:{ colParent:'log' },
        log_id_ch:{ colParent:'log' },
		type         : { maxLength:1, colIndex:true },
		basis        : { colParent:'page' },
		sort         : { max:2000, colIndex:true },
		lft          : { type:'number', colIndex:true },
		rgt          : { type:'number', colIndex:true },
		module       : { maxLength:127, colIndex:true }, // colParent: 'module'
		access       : { max:3, colIndex:true },
		online_start : { type:'datetime', colIndex:true },
		online_end   : { type:'datetime', colIndex:true },
		visible      : { type:'bool' },
		searchable   : { type:'bool', colIndex:true },
		title_id     : { colParent:'text'},
		name         : { maxLength:64, colIndex:true },
		_cache       : { type:'string' },
    }},
    page_class:{properties:{
        page_id: { colParent:'page' },
        class:   { maxLength:'64' },
    }},
    page_acces_grp:{properties:{
        page_id: { colParent:'page', colIndex:'primary' },
        grp_id:  { colParent:'grp', colIndex:'primary' },
        access:  { max:3 },
    }},
    page_acces_usr:{properties:{
        page_id: { colParent:'page', colIndex:'primary' },
        usr_id:  { colParent:'usr', colIndex:'primary' },
        access:  { max:3 },
    }},
    page_file:{properties:{
        page_id: { colParent:'page', colIndex:'primary' },
        name:    { maxLength:191, colIndex:'primary' },
        file_id: { colParent:'file', colIndex:true },
        sort:    { max:3000, colIndex:true },
    }},



}};

/*
	<table name="page_redirect">
		<field name="request"  type="varchar"  length="255" key="PRI" null=""  />
		<field name="redirect" type="text"     length=""    key=""    null="" />
	</table>
	<table name="page_text">
		<field name="page_id"  type="int"      length="10"  key="PRI" null="" parent="page" on_parent_delete="cascade" />
		<field name="name"     type="varchar"  length="128" key="PRI" null="" />
		<field name="text_id"  type="int"      length="10"  key="MUL" null="" parent="text" on_parent_delete="cascade" />
	</table>
	<table name="page_url">
		<field name="page_id"  type="int"                   key="PRI" null="" parent="page" on_parent_delete="cascade" />
		<field name="lang"     type="varchar"  length="12"  key="PRI" null="" />
		<field name="url"      type="varchar"  length="255" key="MUL" null="" />
		<field name="custom"   type="tinyint"  length="1"             null="" />
		<field name="target"   type="text"                            null="" />
	</table>
	<table name="grp">
		<field name="page_access" type="tinyint" length="1" key="MUL" null="" />
	</table>
	<table name="mail">
		<field name="page_id"     type="int"                key="MUL" null="true" parent="page" on_parent_delete="setnull" />
	</table>
</dbscheme>
*/