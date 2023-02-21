
/**
 * get image infos
 * @param {string} path - path of image
 */
export const info = async function(path) {
    const p = Deno.run({
        cmd: ['magick', 'convert', path, '-format', '%[w]|%[h]|%A|%C|%z|%r|%Q', "info:"],
        stdout: "piped",
        stderr: "piped",
    });
    //const status = await p.status();
    const rawOutput = await p.output();
    const output = new TextDecoder().decode(rawOutput);
    const [width, height, alpha, compression, depth, classColorspace, quality] = output.split('|');
    const data = {
        width:parseInt(width),
        height:parseInt(height),
        alpha,
        compression,
        depth,
        classColorspace,
        quality
    }
    return data;
    // console.log(output);
    // console.log(status);
}

/**
 * resize a image
 * @param {string} from - path to image
 * @param {Object} options - with of exported image
 * @param {string} [options.to] - path to export the image, if omit, it will rewrite the original
 * @param {number} [options.w] - with of exported image
 * @param {number} [options.h] - height of exported image
 * @param {boolean} [options.crop] - if true it works like css "background-position:contains", if false like "background-size:cover"
 * @param {number} [options.vpos] - like css 0.5 => background-position-y:50%
 * @param {number} [options.hpos] - like css 0.2 => background-position-x:20%
 */
export async function resize(from, {to, w, h, crop=false, vpos=.5, hpos=.5}) {
    if (to===undefined) to = from;
    let cmd = null;
    if (!crop || h === undefined || w == undefined) {
        cmd = ['magick', 'convert', from, '-resize', w +'x'+h+'\>', to]; // fit
    } else  { // can make images bigger then original, what should i do?
        // crop
        const data = await info(from);
        const factor = Math.max(h/data.height, w/data.width);
        const offX = (data.width  * factor - w) * hpos;
        const offY = (data.height * factor - h) * vpos;
        cmd = ['magick', 'convert', from, '-resize', w+'x'+h+'^', `-crop`, `${w}x${h}+${offX}+${offY}`, to];
    }
    const p = Deno.run({
        cmd,
        stdout: "piped",
        stderr: "piped",
    });
    const status = await p.status();
    console.log(status)
    const error = new TextDecoder().decode(await p.stderrOutput());
    console.log(error);
}
