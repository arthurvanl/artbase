export declare interface IUser {
	id: number;
	name: string;
	email: string;
	salt: string;
	password_hash: string;
	picture: string;
	isAdmin: boolean;
	created_at: Date;
	updated_at: Date;
}