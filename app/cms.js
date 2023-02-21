import {Cms} from '../cms/CMS.js';

export const namespace = 'cms';

export function init(app){
    app.cms = new Cms(app.db);
}

export async function serve (ctx) {
	const page = await this.cms.pageFromRequest(ctx.appUrlPart);
	if (page) {
        let body = await page.render();
        body += ctx.in.url.toString();
        ctx.out.body = body;
        return true;
    }
}


import * as schemas from '../cms/dbSchema.js';
//export {db:schemas.db};
