
console.warn('deprecated');

export class Session {
	constructor(request){
		this.store = SessionStoreMemory;
		this.request = request;
	}
	async init() {
		let reportedId = this.request.cookie.get('sess');
		if (!reportedId) {
			await this._create();
		} else {
			this.data = await this.store.getData(reportedId);
			if (this.data) {
				this.id = reportedId;
			} else { // session not found on server
				await this._create();
			}
		}
		this.oldJsonString = JSON.stringify(this.data);
	}
	async _create(){
		this.id = Math.random();
		this.request.cookie.set('sess', this.id);
		this.data = await this.store.createData(this.id);
	}
	async save() {
		const newJsonString = JSON.stringify(this.data);
		var changed = this.oldJsonString !== newJsonString;
		if (changed) this.store.saveData(this.id, this.data);
	}
}


const SessionStoreMemory = {
	async createData(id){
		const sess = this.allSessions[id] = {
			created: Date.now(),
			lastAccess: Date.now(),
			data:{}
		};
		return sess.data;
	},
	async getData(id){
		if (!this.allSessions[id]) return false;
		this.allSessions[id].lastAccess = Date.now();
		return this.allSessions[id].data;
	},
	async saveData(id, data) {
		this.allSessions[id].data = data;
	},
	allSessions:{}
};
