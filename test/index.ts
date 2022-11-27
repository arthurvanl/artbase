import ArtBase from '../src/index.js';
import type { IUser } from './types.js';

let db = new ArtBase({
    host: 'db.arthurvanl.nl',
    port: 3306,
    user: "quarth_user",
    password: "Wit-geel85",
    database: 'gensa'
});

let data = await db.select<IUser>(['name', 'email'], {id: 6}, 'user');
if(!data) console.log('No data found');
if(data) console.log(data[0]); // returns IUser[]

const selectUser = db.createSelector<IUser>();

let user = await selectUser(['name', 'email'], {id: 6}, 'user');
if(!user) console.log('No data found');
if(user) console.log(user[0]); // returns Pick<IUser, "name" | "email">[]