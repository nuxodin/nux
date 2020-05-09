
class TextPro {
    constructor(db, id){
        this.db = db;
        this.id = id;
        this._texts = {};
        all[id] = this;
    }
    async get(lang){
        if (!this._texts[lang]){
            const rowId = await this.db.table('text').rowId({id:this.id, lang});
            this._texts[lang] = this.db.table('text').row(rowId);
        }
        return this._texts[lang];
    }
    async translated(lang){
        const Text = await this.get(lang);
        const value = await Text.cell('text').value;
        if (!value) {
            for (let l of ['de','en']) {
                if (l === lang) continue;
                const Text = await this.get(l);
                const value = await Text.cell(text).value;
                if (value) break;
            }
        }
        return value;
    }
}

const all = {};
function TextPro_factory(db, id){
    return all[id] || new TextPro(db, id);
}
TextPro_factory.generate = async function(db){
    const data = {lang:'en'};
    await db.table('text').insert(data);
    return TextPro_factory(db, data.id);
};

export default TextPro_factory;
