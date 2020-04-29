
export const schema = {
    db:{items:{usr:{items:{
        id:{
            format: 'uint32',
            index: 'primary',
        },
        username:{
            maxLenght: 50,
        },
        password:{
            format: 'password',
            maxLenght: 50,
        },
        firstname:{
            maxLenght: 50,
            transform: {
                trim:true,
                case:lower,
                caseFirst:upper,
            }
        },
        lastname:{
            maxLenght: 50,
            transform: {
                trim:true,
                case:lower,
                caseFirst:upper,
            }
        },
    }}}}
}

export const serve = {
    '/api/login': req => {
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
