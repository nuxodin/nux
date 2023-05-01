import {dump} from 'https://cdn.jsdelivr.net/gh/nuxodin/dump.js/mod.js';

export const namespace = 'moduleManager';

export async function serve(ctx) {
    if (ctx.appUrlPart === 'moduleManager') {

        ctx.out.body += `
            <!DOCTYPE html>
            <html lang="en">
                <body>
            `+
            dump(window);

        return true;
    }
}
