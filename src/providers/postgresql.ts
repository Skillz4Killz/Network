// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
import { SQLProvider, Type, QueryBuilder, klasaUtil, SchemaEntry, ProviderStore, ProviderOptions } from '../imports';
import { Pool, PoolClient } from 'pg';

export default class extends SQLProvider {

	public qb: QueryBuilder;
	public replace = this.update;

	private dbconnection!: PoolClient;
	private db!: Pool;

	public constructor(store: ProviderStore, file: string[], directory: string, options?: ProviderOptions) {
		super(store, file, directory, options);

		this.qb = new QueryBuilder({
			array: type => `${type}[]`,
			arraySerializer: (values, piece, resolver) =>
				values.length ? `array[${values.map(value => resolver(value, piece)).join(', ')}]` : "'{}'",
			formatDatatype: (name, datatype, def = null) =>
				`"${name}" ${datatype}${def !== null ? ` NOT NULL DEFAULT ${def}` : ''}` //eslint-disable-line
		})
			.add('boolean', { type: 'BOOL' })
			.add('integer', { type: ({ max }: SchemaEntry) => max! >= 2 ** 32 ? 'BIGINT' : 'INTEGER' })
			.add('float', { type: 'DOUBLE PRECISION' })
			.add('uuid', { type: 'UUID' })
			.add('any', { type: 'JSON', serializer: input => `'${JSON.stringify(input)}'::json` })
			.add('json', { 'extends': 'any' });
	}

	public async init() {
		const connection = klasaUtil.mergeDefault({
			host: 'localhost',
			port: 5432,
			database: 'klasa',
			options: {
				max: 20,
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 2000
			}
		}, this.client.options.providers.postgresql);

		this.db = new Pool(Object.assign({
			host: connection.host,
			port: connection.port,
			user: connection.user,
			password: connection.password,
			database: connection.database
		}, connection.options));

		this.db.on('error', err => this.client.emit('error', err));
		this.dbconnection = await this.db.connect();
	}

	public shutdown() {
		this.dbconnection.release();
		return this.db.end();
	}

	/* Table methods */

	public hasTable(table: string) {
		return this.runAll(`SELECT true FROM pg_tables WHERE tablename = '${table}';`)
			.then(result => result.length !== 0 && result[0].bool === true)
			.catch(() => false);
	}

	public createTable(table: string, rows: any[]) {
		if (rows) return this.run(`CREATE TABLE ${sanitizeKeyName(table)} (${rows.map(([k, v]) => `${sanitizeKeyName(k)} ${v}`).join(', ')});`);
		const gateway = this.client.gateways.get(table);
		if (!gateway) throw new Error(`There is no gateway defined with the name ${table} nor an array of rows with datatypes have been given. Expected any of either.`);

		const schemaValues = [...gateway.schema.values(true)];
		// @ts-ignore
		return this.run(`CREATE TABLE ${sanitizeKeyName(table)} (${[`id VARCHAR(${gateway.idLength || 18}) PRIMARY KEY NOT NULL UNIQUE`, ...schemaValues.map(this.qb.generateDatatype.bind(this.qb))].join(', ')})`);
	}

	public deleteTable(table) {
		return this.run(`DROP TABLE IF EXISTS ${sanitizeKeyName(table)};`);
	}

	public countRows(table) {
		return this.runOne(`SELECT COUNT(*) FROM ${sanitizeKeyName(table)};`)
			.then(result => Number(result.count));
	}

	/* Row methods */

	public getAll(table: string, entries = []) {
		if (entries.length) {
			return this.runAll(`SELECT * FROM ${sanitizeKeyName(table)} WHERE id IN ('${entries.join("', '")}');`)
				.then(results => results.map(output => this.parseEntry(table, output)));
		}
		return this.runAll(`SELECT * FROM ${sanitizeKeyName(table)};`)
			.then(results => results.map(output => this.parseEntry(table, output)));
	}

	public getKeys(table: string) {
		return this.runAll(`SELECT id FROM ${sanitizeKeyName(table)};`)
			.then(rows => rows.map(row => row.id));
	}


	public get(table: string, key: string, value?: any) {
		// If a key is given (id), swap it and search by id - value
		if (typeof value === 'undefined') {
			value = key;
			key = 'id';
		}
		return this.runOne(`SELECT * FROM ${sanitizeKeyName(table)} WHERE ${sanitizeKeyName(key)} = $1 LIMIT 1;`, [value])
			.then(output => this.parseEntry(table, output));
	}

	public has(table: string, id: string) {
		return this.runOne(`SELECT id FROM ${sanitizeKeyName(table)} WHERE id = $1 LIMIT 1;`, [id])
			.then(result => Boolean(result));
	}

	public getRandom(table: string) {
		return this.runOne(`SELECT * FROM ${sanitizeKeyName(table)} ORDER BY RANDOM() LIMIT 1;`);
	}

	public getSorted(table: string, key: string, order = 'DESC', limitMin: number, limitMax: number) {
		return this.runAll(`SELECT * FROM ${sanitizeKeyName(table)} ORDER BY ${sanitizeKeyName(key)} ${order} ${parseRange(limitMin, limitMax)};`);
	}

	public create(table: string, id: string, data) {
		const [keys, values] = this.parseUpdateInput(data, false);

		// Push the id to the inserts.
		if (!keys.includes('id')) {
			keys.push('id');
			values.push(id);
		}
		return this.run(`
			INSERT INTO ${sanitizeKeyName(table)} (${keys.map(sanitizeKeyName).join(', ')})
			VALUES (${Array.from({ length: keys.length }, (__, i) => `$${i + 1}`).join(', ')});`, values);
	}

	public update(table: string, id: string, data) {
		const [keys, values] = this.parseUpdateInput(data, false);
		/* eslint-disable */
		return this.run(`
			UPDATE ${sanitizeKeyName(table)}
			SET ${keys.map((key, i) => `${sanitizeKeyName(key)} = $${i + 1}`)}
			WHERE id = '${id.replace(/'/, "''")}';`, values);
	}
	/* eslint-enable */

	public incrementValue(table: string, id: string, key: string, amount = 1) {
		return this.run(`UPDATE ${sanitizeKeyName(table)} SET $2 = $2 + $3 WHERE id = $1;`, [id, key, amount]);
	}

	public decrementValue(table: string, id: string, key: string, amount = 1) {
		return this.run(`UPDATE ${sanitizeKeyName(table)} SET $2 = GREATEST(0, $2 - $3) WHERE id = $1;`, [id, key, amount]);
	}

	public delete(table: string, id: string) {
		return this.run(`DELETE FROM ${sanitizeKeyName(table)} WHERE id = $1;`, [id]);
	}

	public addColumn(table: string, piece) {
		return this.run(piece.type === 'Folder'
			? `ALTER TABLE ${sanitizeKeyName(table)} ADD COLUMN ${this.qb.generateDatatype(piece)};`
			: `ALTER TABLE ${sanitizeKeyName(table)} ${[...piece.values(true)].map(subpiece => `ADD COLUMN ${this.qb.generateDatatype(subpiece)}`).join(', ')};`);
	}

	public removeColumn(table: string, columns) {
		if (typeof columns === 'string') return this.run(`ALTER TABLE ${sanitizeKeyName(table)} DROP COLUMN ${sanitizeKeyName(columns)};`);
		if (Array.isArray(columns)) return this.run(`ALTER TABLE ${sanitizeKeyName(table)} DROP COLUMN ${columns.map(sanitizeKeyName).join(', ')};`);
		throw new TypeError('Invalid usage of PostgreSQL#removeColumn. Expected a string or string[].');
	}

	public updateColumn(table: string, piece) {
		const [column, datatype] = this.qb.generateDatatype(piece).split(' ');
		return this.run(`ALTER TABLE ${sanitizeKeyName(table)} ALTER COLUMN ${column} TYPE ${datatype}${piece.default
			? `, ALTER COLUMN ${column} SET NOT NULL, ALTER COLUMN ${column} SET DEFAULT ${this.qb.serialize(piece.default, piece)}`
			: ''
		};`);
	}

	public getColumns(table: string, schema = 'public') {
		return this.runAll(`
			SELECT column_name
			FROM information_schema.columns
			WHERE table_schema = $1
				AND table_name = $2;
		`, [schema, table]).then(result => result.map(row => row.column_name));
	}

	public run(...sql) {
		return this.db.query(...sql)
			.then(result => result);
	}

	public runAll(...sql) {
		return this.run(...sql)
			.then(result => result.rows);
	}

	public runOne(...sql) {
		return this.run(...sql)
			.then(result => result.rows[0]);
	}

}

/**
 * @param {string} value The string to sanitize as a key
 * @returns {string}
 * @private
 */
function sanitizeKeyName(value: string) {
	if (typeof value !== 'string') throw new TypeError(`[SANITIZE_NAME] Expected a string, got: ${new Type(value)}`);
	if (/`|"/.test(value)) throw new TypeError(`Invalid input (${value}).`);
	if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') return value;
	return `"${value}"`;
}

/**
 * @param {number} [min] The minimum value
 * @param {number} [max] The maximum value
 * @returns {string}
 * @private
 */
function parseRange(min: number, max: number) {
	// Min value validation
	if (typeof min === 'undefined') return '';
	if (!klasaUtil.isNumber(min)) {
		throw new TypeError(`[PARSE_RANGE] 'min' parameter expects an integer or undefined, got ${min}`);
	}
	if (min < 0) {
		throw new RangeError(`[PARSE_RANGE] 'min' parameter expects to be equal or greater than zero, got ${min}`);
	}

	// Max value validation
	if (typeof max !== 'undefined') {
		if (!klasaUtil.isNumber(max)) {
			throw new TypeError(`[PARSE_RANGE] 'max' parameter expects an integer or undefined, got ${max}`);
		}
		if (max <= min) {
			throw new RangeError(`[PARSE_RANGE] 'max' parameter expects ${max} to be greater than ${min}. Got: ${max} <= ${min}`);
		}
	}

	return `LIMIT ${min}${typeof max === 'number' ? `,${max}` : ''}`;
}
