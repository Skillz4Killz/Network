// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
import { Provider, util } from 'klasa';
import { MongoClient } from 'mongodb';

const resolveQuery = query => util.isObject(query) ? query : { id: query };

export default class extends Provider {

	public db = null;

	public async init() {
		const connection = util.mergeDefault({
			host: 'localhost',
			port: 27017,
			db: 'klasa',
			options: {}
		}, this.client.options.providers.mongodb);

		// If full connection string is provided, use that, otherwise fall back to individual parameters
		const connectionString = this.client.options.providers.mongodb.connectionString || `mongodb://${connection.user}:${connection.password}@${connection.host}:${connection.port}/${connection.db}`;

		const mongoClient = await MongoClient.connect(
			connectionString,
			util.mergeObjects(connection.options, { useNewUrlParser: true })
		);

		this.db = mongoClient.db(connection.db);
	}

	/* Table methods */

	public get exec() {
		return this.db;
	}

	public hasTable(table) {
		return this.db.listCollections().toArray().then(collections => collections.some(col => col.name === table));
	}

	public createTable(table) {
		return this.db.createCollection(table);
	}

	public deleteTable(table) {
		return this.db.dropCollection(table);
	}

	/* Document methods */

	public getAll(table, filter = []) {
		if (filter.length) return this.db.collection(table).find({ id: { $in: filter } }, { _id: 0 }).toArray();
		return this.db.collection(table).find({}, { _id: 0 }).toArray();
	}

	public getKeys(table) {
		return this.db.collection(table).find({}, { id: 1, _id: 0 }).toArray();
	}

	public get(table, id) {
		return this.db.collection(table).findOne(resolveQuery(id));
	}

	public has(table, id) {
		return this.get(table, id).then(Boolean);
	}

	public getRandom(table) {
		return this.db.collection(table).aggregate({ $sample: { size: 1 } });
	}

	public create(table, id, doc = {}) {
		return this.db.collection(table).insertOne(util.mergeObjects(this.parseUpdateInput(doc), resolveQuery(id)));
	}

	public delete(table, id) {
		return this.db.collection(table).deleteOne(resolveQuery(id));
	}

	public update(table, id, doc) {
		return this.db.collection(table).updateOne(resolveQuery(id), { $set: util.isObject(doc) ? flatten(doc) : parseEngineInput(doc) });
	}

	public replace(table, id, doc) {
		return this.db.collection(table).replaceOne(resolveQuery(id), this.parseUpdateInput(doc));
	}

}


function flatten(obj, path = '') {
	let output = {};
	for (const [key, value] of Object.entries(obj)) {
		if (util.isObject(value)) output = Object.assign(output, flatten(value, path ? `${path}.${key}` : key));
		else output[path ? `${path}.${key}` : key] = value;
	}
	return output;
}

function parseEngineInput(updated) {
	return Object.assign({}, ...updated.map(entry => ({ [entry.key]: entry.value })));
}
