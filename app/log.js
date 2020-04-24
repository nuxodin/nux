
export const schema = {
    db:{items:{log:{items:{
        id:{
            type: 'Uint32',
            index: 'primary',
        },
    }}}}
}

export const serve = {
    '*':(req)=>{
        nux.log = await req.app.db.log.insert({});
    },
}
