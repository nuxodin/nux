import {stat} from '../util/nuxo.js';
import * as imagick from '../imagick/mod.js';

export class dbFileManager {
    constructor(db, {cacheDir, rootDir, rootUrl = '/'}){
        this.cacheDir = cacheDir;
        this.rootDir = rootDir;
        this.rootUrl = rootUrl;
        this.db = db;
    }
    dbFile(id){
        if (!this.pool[id]) this.pool[id] = new dbFile(this, id);
        return this.pool[id];
    }


	async add(path=null) {
        const id = await this.db.table('dbFile').insert();
        const dbFile = this.dbFile(id);
        path && await dbFile.replaceBy(path);
		return dbFile;
	}
	async output(ctx) {
        const root = this.rootUrl + '/dbFile/';
        if (!ctx.url.pathName.startsWith(root)) return false;
        const request = ctx.url.pathName.substr(root.length);
        const x = request.split('/');
        const id = parseInt(x.shift());
		const name = x.pop();
        const param = {};
        for (const part of x) {
            part.split('-') // limit?
            param[part[0]] = part[1] ?? true;
        }
		//qg::fire('file_ouput-before');
        let File = this.dbFile(id);
        const RequestedFile = File;

        if (! await File.exists()) {
            ctx.out.status = 404;
            return false;
		}
		if (! await File.access()) {
            ctx.out.status = 401;
            return false;
		}

		// Header
		let mime = File.mime() ?? File.extensionToMime(File.extension());
        if (mime==='image/svg+xml') mime += '; charset=utf-8';
        ctx.out.header.set('last-modified', new Date(File.mtime).toISOString() + ' GMT');
        //ctx.out.header.set('last-modified', gmdate('D, d M Y H:i:s', File.mtime) + ' GMT');
        if (param.u) {
            const expires = Math.round(Date.now()/1000) + 60*60*24*180;
            ctx.out.header.set('expires', new Date(expires).toISOString() + ' GMT');
            ctx.out.header.set('cache-control', 'max-age=' + expires + ', private, immutable');
            ctx.out.header.set('pragma', 'private'); // needed or els it will not cache?
        } else {
            // todo
        }

        // header('Content-DPR: '.$dpr); // todo
		File = await File.transform(param);
		// if (preg_match('/\.pdf$/', $name) || $File->mime() == 'application/pdf') {
		// 	$mime = 'application/pdf';
		// 	header('Content-Disposition: inline; filename="'.$RequestedFile->name().'";');
		// 	header('Expires: 0');
		// 	header('Cache-Control: must-revalidate'); // why?
		// }
		// if (isset($param['dl'])) {
		// 	$mime = 'application/force-download';
		// 	header('Expires: 0');
		// 	header('Cache-Control: private, must-revalidate'); // why?
		// 	header('Content-Disposition: attachment; filename="'.$RequestedFile->name().'";');
		// 	header('Content-Transfer-Encoding: binary');
		// }
		// if (isset($param['as'])) {
		// 	if ($param['as'] === 'text') $mime = 'text/plain';
        // }

        ctx.out.header.set('content-type', mime);

        const etag = 'qg' + File.mtime;
        const HTTP_IF_NONE_MATCH = ctx.in.headers.get('HTTP_IF_NONE_MATCH');
        if (!HTTP_IF_NONE_MATCH || HTTP_IF_NONE_MATCH !== etag) {
            //const HTTP_RANGE = ctx.in.headers.get('HTTP_RANGE');
            //if (HTTP_RANGE) {
			//	if (x_stream(File.path, HTTP_RANGE)) return;
			//}
            ctx.out.header.set('etag', etag);
            ctx.out.header.set('content-length', File.size);
            ctx.out.body = File;
		} else {
            ctx.out.status = 304; //header("HTTP/1.1 304 Not Modified");
		}
	}


}


class dbFile {
    constructor(manager, id) {
        this.manager = manager;
        this.id = id;
        this.dbRow = this.manager.db.table('dbFile').row(this.id);
    }
    async path(){
        const md5 = await this.dbRow.cell('md5').value();
        return this.manager.rootDir + '/' + md5;
    }
	async url(){
        const md5 = await this.dbRow.cell('md5').value();
        const params = [this.id, 'u-' + md5.substr(0,4)];
        // const defParams = await this.dbRow.cell('default_params').value();
        // for (let [name, val] of Object.entries(defParams)) {
        //     params.push(name + '-' + val);
        // }
        // const name = await this.dbRow.cell('name').value();
        // params.push(name);
		return this.rootUrl + 'dbFile/' + params.join('/'); // todo: include vpos, hpos, so the url it is unique to the delevered content
	}




	async setVs(data){
        this.dbRow.set(data);
	}
	async access(ctx, set) {
        if (set === undefined) {
            const access = await this.dbRow.cell('access').value(); // todo: rename to "public"
            if (access) return true;
            return await this.manager.requestAccess(ctx, this);
        }
        this.dbRow.set({access:!!set}); // todo: rename to "public"
	}
	async name(set) {
        if (set === undefined) return await this.dbRow.cell('name').value();
        this.dbRow.cell('name').set(set);
	}
	async extension() {
        const name = await this.name();
        return name.replace(/.*\./, '').toLowerCase();
	}
	async mime() {
        return await this.dbRow.cell('mime').value();
    }
    /*
	function uploadTicket($opt = []) {
		$opt['dbfile'] = $this->id;
		return parent::uploadTicket($opt);
    }
    */
	async updateDb() {
		//$this->path = appPATH.'qg/file/'.$this->vs['md5'];
		//$this->setVs(['text'=>$this->getText(), 'size'=>$this->size()]);
	}
	toString() {
		return this.id+'';
	}
	async used(){
		// foreach (D()->file->Children() as $Field) {
		// 	$has = D()->one("SELECT ".$Field." FROM ".table($Field->Table)." WHERE ".$Field." = ".(int)$this->id." LIMIT 1 ");
		// 	if ($has) return true;
		// }
		// $used = false;
		// qg::fire('dbFile-used', ['dbFile'=>$this, 'used' => &$used]);
		// return $used;
	}
	async remove() {
		// D()->file->delete($this);
		// $prevent = false;
		// qg::fire('dbFile-remove-fs', ['dbFile'=>$this, 'prevent' => &$prevent]);
		// if ($prevent) return;
		// !D()->one("SELECT id FROM file WHERE md5 = ".D()->quote($this->vs['md5'])) && unlink($this->path); // better in db-delete-event
	}
	async replaceBy(path) {
		const F = new File(path);
 		// if (preg_match('/^https?:\/\//',$path)) {
		// 	// not very beautiful
		// 	stream_context_set_default(['ssl'=> ['verify_peer'=>false,'verify_peer_name'=>false]]); // allow files from https
		// 	$basename = $F->basename();
		// 	$content = file_get_contents($path);  // bad: fill ram with content...
		// 	foreach ($http_response_header as $header) { // get filename (Content-Disposition-header)
		// 		$name_value = explode(':',$header,2);
		// 		if (!isset($name_value[1])) continue;
		// 		$name  = trim(strtolower($name_value[0]));
		// 		$value = trim($name_value[1]);
		// 		if ($name === 'content-disposition') {
		// 			preg_match('/filename="([^"]+)"/', $value, $matches);
		// 			if ($matches[1]) {
		// 				$basename = $matches[1];
		// 				break;
		// 			}
		// 		}
		// 	}
		// 	$tmp = appPATH.'cache/tmp/'.preg_replace('/\?.*/','',$basename);
		// 	$F = new File($tmp);
		// 	$F->contents($content);
		// }
		const md5 = F.md5();
		this.path = this.rootDir + '/dbFile/' + md5;
        await Deno.copyFile(path, this.path); // old file is not deleted, maybe use in other workspace!
        const fStat = await stat(this.path);
		await this.setVs({
			name : F.basename(),
			mime : F.mime(),
			//text : F.getText(),
			md5: md5,
			size: fStat.size, // not $F->size(), cause it can be a url!
        });
	}
	async replaceFromUpload($f) {  // old file is not deleted, maybe use in other workspace!
		// $md5 = md5_file($f['tmp_name']);
		// $this->path = appPATH.'qg/file/'.$md5;
		// move_uploaded_file($f['tmp_name'], $this->path);
		// $ext = strtolower(preg_replace('/.*\./', '', $f['name']));
		// $type = $f['type'] === 'application/octet-stream' ? File::extensionToMime($ext) : $f['type'];
		// $type = preg_replace('/;.*/', '', $type);
		// $this->setVs([
		// 	'name' => $f['name'],
		// 	'mime' => $type,
		// 	'md5'  => $md5,
		// 	'size' => $this->size(),
		// 	'text' => $this->getText(),
		// ]);
	}
	async clone(to=null) {
		// $data = $this->vs;
		// if ($to===null) {
		// 	unset($data['id']);
		// 	$to = D()->file->insert($data);
		// } else {
		// 	$data['id'] = (string)$to;
		// 	D()->file->update($data);
		// 	unset(dbFile::$All[(string)$to]); // remove cache
		// }
		// return dbFile($to);
	}
	async transform(params) {
        //todo: first set own defaults (default_params);
        const type = Image.able( await this.path() );
		if (type) {
			if (type==='image/gif' && image.is_gif_animated(this.path) /* 0.5 ms*/ ) {
				return this;
            }
			let w = parseInt(params.w ?? 0);
			let h = parseInt(params.h ?? 0);

			//let dpr = $_SERVER['HTTP_DPR'] ?? $_COOKIE['q1_dpr'] ?? 1; // todo: move to ::output()
			//dpr = round(dpr,1);
			// if ($dpr > 1) {
			// 	if (params.dpr ?? G()->SET['qg']['dbFile_dpr_dependent']->v) {
			// 		$w *= (float)$dpr;
			// 		$h *= (float)$dpr;
			// 	}
            // }
            const dpr = parseFloat(params.dpr ?? 1);
            if (dpr > 1) {
                w *= dpr;
                h *= dpr;
            }
            w = Math.min(w,9000);
			h = Math.min(h,9000);
			const q    = parseInt(params.q ?? 77);
			const max  = !!(params.max ?? false);
			const vpos = parseFloat(params.vpos ?? 50);
			const hpos = parseFloat(params.hpos ?? 50);
			const zoom = parseFloat(params.zoom ?? 0);
			type = this.mime.repace('image/', '');

            const md5 = await this.dbRow.cell('md5').value();
			const unique = [md5,w,h,q,max,vpos,hpos,zoom,type].join();

			// plugins
			// foreach (self::$transformers as $name => $transformer) {
			// 	if (!isset(params[$name])) continue;
			// 	unique .= '&'.$name.'='.params[$name]??'';
			// }

            const newFile = new File(this.manager.cacheDir + '/' + unique);
            const newStat = await stat(newFile);

            if (!newStat || fileStat.mtime > newStat.mtime) {
				const Img = new Image(this.path);
				if (w == 0 && h == 0) w = Img.width;

				// prevent enlarge
				const oldW = w;
				const oldH = h;
				w = Math.min(Img.width, $w);
				h = Math.min(Img.height, $h);

				// todo: what about zoom?
				imagick.resize(this.path, {
					to:newFile.path,
					width:w,
					height:h,
					crop:max,
				})

				// plugins
				//foreach (self::$transformers as $name => $transformer) $transformer['transform']($Img->Img, params);

				// old:
				//Img.saveAs(newFile->path, type, q);

				// new:
				// if ($type==='jpeg') {
				// 	$Img->saveAs($nFile->path, $type, $q);
				// } else { // if it is a png check if a jpg would be smaller
				// 	if (Image::has_alpha($this->path)) {
				// 		$Img->saveAs($nFile->path, $type, $q);
				// 		$type = 'png'; // if its a gif
				// 	} else {
				// 		$jpgPath = appPATH.'cache/tmp/pri/'.$this->vs['md5'].'.jpg';
				// 		$pngPath = appPATH.'cache/tmp/pri/'.$this->vs['md5'].'.png';
				// 		$Img->saveAs($jpgPath, 'jpeg', $q);
				// 		$Img->saveAs($pngPath, 'png');
				// 		if (filesize($jpgPath) > filesize($pngPath)) {
				// 			rename($pngPath, $nFile->path);
				// 			unlink($jpgPath);
				// 			$type = 'png';
				// 		} else {
				// 			rename($jpgPath, $nFile->path);
				// 			unlink($pngPath);
				// 			$type = 'jpeg';
				// 		}
				// 	}
				// }
			}
			//const mime = 'image/' + type;
			return newFile;
			// header("Pragma: public"); // Emails!?
			// Pragma is the HTTP/1.0 implementation and cache-control is the HTTP/1.1 implementation of the same concept.
			// header("Pragma: private"); // required, why
		}
		return this;
	}

	//public static $transformers = [];

}




// function x_stream($file) {
//     $filesize = sprintf("%u", filesize($file));
// 	list($param, $range) = explode('=', $_SERVER['HTTP_RANGE']);
// 	if ($param != 'bytes') trigger_error('not "bytes"?');
// 	// Get range values
// 	$range = explode(',',$range);
// 	$range = explode('-',$range[0]);
// 	// Deal with range values
// 	if ($range[0] === ''){
// 		$end = $filesize - 1;
// 		$start = $end - (int)$range[0];
// 	} else if ($range[1] === '') {
// 		$start = (int)$range[0];
// 		$end = $filesize - 1;
// 	} else {
// 		// Both numbers present, return specific range
// 		$start = (int)$range[0];
// 		$end =   (int)$range[1];
// 		if ($end >= $filesize || (!$start && (!$end || $end == ($filesize - 1)))) return; // Invalid range/whole file specified, return whole file
// 	}
// 	$length = $end - $start + 1;
//     // Send standard headers
//     header('Content-Length: ' .$length);
//     header('Accept-Ranges: bytes');
//     // send extra headers for range handling...
// 	header('HTTP/1.1 206 Partial Content');
// 	header("Content-Range: bytes $start-$end/$filesize");
// 	$fp = fopen($file, 'rb');
// 	if ($start) fseek($fp,$start);
// 	while ($length) {
// 		//set_time_limit(0);
// 		$read = ($length > 8192) ? 8192 : $length;
// 		$length -= $read;
// 		print(fread($fp,$read));
// 	}
// 	fclose($fp);
// 	return true;
// }
