import { serve } from "https://deno.land/std/http/server.ts"import { getNuxRequest } from "../../nux_app/request"
import { LoggerConfig } from "https://deno.land/x/std/log/mod.ts"import { appendFile } from "fs"
import { Hash } from "crypto"
export var privileges = [db, schema, ]

export const schema = {
    db:{items:{usr:{items:{
        id:{
            type: 'Uint32',
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
                case:ucfirst,
            }
        },
        lastname:{
            maxLenght: 50,
            transform: {
                trim:true,
                case:ucfirst,
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
