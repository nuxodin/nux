import pageClass from './Page.js';

export class Cms {
    constructor(db){
        this.db = db;
        this.db.table('page').rowClass = pageClass; // bad here !
    }
    Page(id){
        return this.db.table('page').row(id);
    }
    async pageFromRequest(url) {
        var page_id = await this.db.one("SELECT page_id FROM page_url WHERE url = "+this.db.quote(url));
        if (!page_id) return false;
        return this.Page(page_id);
    }
    async redirectFromRequest(url) {
        var redirect = await this.db.one("SELECT redirect FROM page_redirect WHERE request = "+this.db.quote(url));
        if (!redirect) return false;
        if (redirect.match(/[0-9]+/)) {
            let page = this.Page(redirect);
            //url = server.scheme+'://'+server.host + Page(redirect)->url();
            return await page.url('de');
        }
        //const url = redirect;
        //res.setHeader('Location', 'http://' + req.headers['host'] + ('/' !== req.url)? ( '/' + req.url) : '');
    }
    async render(request) {

        let page = await this.pageFromRequest(request.url);
        if (!page) {
            const redirect = await this.redirectFromRequest(request.url);
            if (redirect) {
                res.statusCode = 301;
                //res.setHeader('Location', 'http://' + req.headers['host'] + ('/' !== req.url)? ( '/' + req.url) : '');
                res.setHeader('Location', redirect);
                res.end();
                return;
            }
            if (true) { // handle 404s by cms
                page = this.Page(50); // not found
                res.status(404);
            } else {
                next();
                return;
            }
        }

        let mainPage = page;
        //let requestedPage = page;

        if (!await page.access()) { // no access
            res.status(401);
            mainPage = this.Page(77);
        }
        if (!await page.isReadable()) { // offline
            res.status(401); // 500?
            mainPage = this.Page(88);
        }

        var body = await mainPage.render();
        return `<html>
            <head>
            <body>${body}`;
    }
}


/* ussage:
const cms = new CMS(db);
for await (let r of serve(":91")) {
	let body = '';
	var page = await cms.pageFromRequest('de/home');
	if (page) {
		body = await page.render();
	}
	req.respond({ body });
}
*/