
// todo: json-schema

export const db = {properties:{
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
