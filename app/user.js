export const namespace = 'user';

export const schema = {
    db:{properties:{
        usr:{properties:{
            id:{
                colAutoincrement:true,
            },
            username:{
                maxLenght: 50,
                minLenght: 5,
                transformTrim: true,
            },
            password:{
                format: 'password',
                maxLenght: 30,
                minLenght: 5,
            },
            firstname:{
                maxLenght: 50,
                transformTrim: true,
                transformCase: 'lower',
                transformCaseFirst: 'upper',
            },
            lastname:{
                maxLenght: 50,
                transformTrim: true,
                transformCase: 'lower',
                transformCaseFirst: 'upper',
            },
        }},
        usr_email:{properties:{
            usr_id: { colParent:'usr', colIndex:'primary', },
            email:  { type: 'email',   colIndex:'primary', },
            trusted:{ type: 'boolean', colIndex:true, },
        }},
        grp:{properties:{
            id:   { colAutoincrement:true, },
            name: { type:'string', maxLength:20, },
            type: { type:'string', maxLength:20, },
        }},
        usr_grp:{properties:{
            usr_id: { colIndex:'primary', colParent:'usr', },
            grp_id: { colIndex:'primary', colParent:'grp', },
        }},
    }}
}


export const routes = {
    '/api/login': async req => {
        const {username, password} = req.post();
        var usr = await app.db.usr.one({username}).get();
        if (usr.field('password') === Hash(password) ) {
            req.sess.usr_id = usr.id;
            return {
                json:{
                    id:usr.id,
                }
            };
        }
    },
    '/api/logout': req => {
        delete req.sess.usr_id;
        return {};
    }
}
