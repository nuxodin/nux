let c1Render = async function (strings, ...values){
	values = await Promise.all(values);
	let result = '';
    strings.forEach((string, key)=>{
		result += string + (values[key] === undefined ? '' : values[key]);
    });
	return result;
}


var templates = Object.create(null);


templates['cms.cont.text'] = async (page) => {
    const Text = await page.text('main','de');
    return '<div'+(page.edit?' contenteditable cmstxt='+Text.id : '')+'>'+Text+'</div>';
};
templates['cms.cont.flexible'] = async (page) => {
    return await c1Render`<div>${(await page.contents()).map(content=>{ return content.render(); })}</div>`;
};
templates['cms.layout.custom.6'] = async (page) => {
    return await c1Render`
    <div>
        <h1>${page.title('de')}</h1>
        <p>${page.text('main','de')}</p>
        <div>${(await page.cont('main')).render()}</div>
        text-Element:
        <div style="border:1px solid red">${(await page.cont('text','cms.cont.text')).render()}</div>
    </div>`;
};
templates['cms.layout.custom.7'] = async (page) => {
    return await c1Render`
    <div>
        <h1>${page.title('de')}</h1>
        <p>${page.text('main','de')}</p>
        <div>${(await page.cont('main')).render()}</div>
        template custom.7:
        text-Element:
        <div style="border:1px solid red">${(await page.cont('text','cms.cont.text')).render()}</div>
    </div>`;
};

export default templates;
