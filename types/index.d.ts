import type { MysqlError } from "mysql";

export declare interface ArtBaseOptions {
    host: string;
	port?: number;
	user: string;
	password: string;
	database: string;
	debug?: boolean;
}

export declare interface DatabaseQueryResponse {
	error: MysqlError | null;
	results: any;
}

export type SelectorReturnType<T, Keys extends Array<keyof T> | null> =
    Keys extends Array<keyof T>	
        ? Array<Pick<T, Keys[number]>>
        : T[];

export type Selector<T> = <Keys extends Array<keyof T> | null>(select: Keys, where: Partial<T> | null, table: string) => Promise<SelectorReturnType<T, Keys> | null>;