import { createPool, OkPacket, Pool } from 'mysql';
import { getTime } from './utils/time.js';
import { beautifyError } from './utils/error.js';

import type { ArtBaseOptions, DatabaseQueryResponse, Selector } from '../types/index.js';

export default class ArtBase {
    public pool: Pool;

    constructor(options: ArtBaseOptions) {
		this.pool = createPool({
			...options,
			typeCast: function (field, next) {
				if (field.type === 'TINY' && field.length === 1) {
					return field.string() === '1'; // 1 = true, 0 = false
				} else if (field.type === 'MEDIUMTEXT' || field.type === 'LONGTEXT') {
					let response: any;
					try {
						response = JSON.parse(field.string() ?? '');
					} catch (err) {
						return field.string();
					}
					return response;
				} else {
					return next();
				}
			},
		});

		// simple debug function to get a lil more info about the pool
		if(options.debug == true)
			this.debug();
	}

    private debug() {
		this.pool.on('aquire', (connection) => {
			console.log(`${getTime()} Connection #${connection.threadId} aquired!`);
		});

		this.pool.on('connection', (connection) => {
			console.log(`${getTime()} Connection #${connection.threadId} connected!`);
		});

		this.pool.on('enqueue', () => {
			console.log(`${getTime()} Waiting for available connection slot`);
		});
	}

	/**
	 * Direct sql query to the server.
	 */
    async query(query: string, values?: any): Promise<DatabaseQueryResponse> {
		const conn = this.pool;

		return new Promise(function (resolve) {
			conn.query(query, values, (error, results) => {
				if (error) beautifyError(error);

				resolve({ error: error, results: results });
			});
		});
	}

	/**
	 * Insert into a table
	 * @example
	 * let user = await db.insert<T>({name: "Arthur", email: "arthur@example.com" }, 'user')
	 * // returns false | OkPacket
	 */
	async insert<T>(columns: Partial<T>, table: string): Promise<false | OkPacket> {
		const query = await this.query(`INSERT INTO \`${table}\` ${this.parseObj(columns, 'INSERT')}`);
		if (query.error) return false;

		return query.results;
	}

	/**
	 * Select columns from a table
	 * @example
	 * let user = await db.select<T>(null, {id: 9 }, 'user')
	 * // returns false | Array<T>
	 * 
	 * // the first param can be used if you only want specific columns returned from the database.
	 * let user = await db.select<T>(['name', 'email'], {id: 9 }, 'user')
	 * // returns false | Array<T>
	 */

	async select<T>(select: Array<keyof T> | null, where: Partial<T> | null, table: string) {
		return await this.createSelector<T>()(select, where, table);
	}

	createSelector<T>(): Selector<T> {

		return async (select, where, table) => {

			const query = await this.query(
				`SELECT ${this.parseObj(select, 'SELECT')} FROM \`${table}\` WHERE ${this.parseObj(where, 'WHERE')}`
				);
			
			if(query.error) return false;

			return query.results as any;
		}
	}

	/**
	 * Update columns in a table
	 * @example
	 * let user = await db.update<T>({name: "Artbase"}, {id: 9 }, 'user')
	 * // returns false | OkPacket
	 */
	async update<T>(columns: Partial<T>, where: Partial<T>, table: string): Promise<false | OkPacket> {
		const query = await this.query(
			`UPDATE \`${table}\` SET ${this.parseObj(columns, 'UPDATE')} WHERE ${this.parseObj(where, 'WHERE')}`
		);
		if (query.error) return false;

		return query.results;
	}

	/**
	 * Delete colums from a table
	 * @example
	 * let user = await db.delete<T>({id: 9}, 'user')
	 * // returns false | OkPacket
	 */
	async delete<T>(where: Partial<T>, table: string): Promise<false | OkPacket> {
		const query = await this.query(`DELETE FROM \`${table}\` WHERE ${this.parseObj(where, 'WHERE')}`);
		if (query.error) return false;

		return query.results;
	}

	/**
	 * Parse obj to a query string using types.
	 */
	private parseObj(obj: any | null, type: 'SELECT' | 'WHERE' | 'UPDATE' | 'INSERT' | 'DELETE'): string {
		let query = '';

		for (const c in obj)
			if (typeof obj[c] == 'boolean') {
				if (obj[c] == false) obj[c] = 0;
				else if (obj[c] == true) obj[c] = 1;
			} else if (obj[c] instanceof Date) obj[c] = obj[c].toISOString().replace('T', ' ').slice(0, -5);
			else if (typeof obj[c] == 'object') obj[c] = JSON.stringify(obj[c]);

		if (type == 'SELECT') {
			if (obj == null) query = '*';
			else if (obj instanceof Array) query = obj.map((v) => `\`${v}\``).join(', ');
		} else if (type == 'WHERE' || type == 'UPDATE' || type == 'DELETE') {
			const fields = [];

			for (const key of Object.keys(obj)) fields.push(`\`${key}\` = '${obj[key]}'`);

			if (fields.length == 0) query = '1';
			else if (type == 'UPDATE') query = fields.join(', ');
			else query = fields.join(' AND ');
		} else if (type == 'INSERT') {
			const columns = Object.keys(obj)
				.map((v) => `\`${v}\``)
				.join(', ');
			const values = Object.values(obj)
				.map((v) => `'${v}'`)
				.join(', ');

			query = `(${columns}) VALUES (${values})`;
		}

		return query;
	}
}