import { getTime } from './time.js';
import type { MysqlError } from 'mysql';

export function beautifyError(err: MysqlError | Error) {
	console.log(
		`${err.stack
			?.split('\n')
			.map((line) => (line = `${getTime()} ${line}\n`))
			.toString()
			.replace(/\,/g, '')}`
	);
}
