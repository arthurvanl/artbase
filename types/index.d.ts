import type { MysqlError } from "mysql";

export declare interface ArtBaseOptions {
    host: string;
	port?: number;
	user: string;
	password: string;
	database: string;
}

export declare interface DatabaseQueryResponse {
	error: MysqlError | null;
	results: any;
}