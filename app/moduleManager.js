import * as html from '../html/html.js';

export const namespace = 'moduleManager';


export async function serve(ctx) {
    if (ctx.appUrlPart === 'moduleManager') {

        ctx.out.body += `
            <!DOCTYPE html>
            <html lang="en">
                <body>
            `+
            html.dump(this);

        return true;
    }
}
