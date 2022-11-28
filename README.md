[![.github/workflows/publish.yml](https://github.com/arthurvanl/artbase/actions/workflows/publish.yml/badge.svg?branch=master)](https://github.com/arthurvanl/artbase/actions/workflows/publish.yml)
[![.github/workflows/build.yml](https://github.com/arthurvanl/artbase/actions/workflows/build.yml/badge.svg)](https://github.com/arthurvanl/artbase/actions/workflows/build.yml)

# [Artbase](https://npmjs.com/package/artbase)

Artbase makes it easier to write sql queries in javascript & typescript.
You can use it to write queries in a more readable way, and to write queries that are easier to maintain.

# Table of contents

- [Installation](#installation)
- [Minimal example](#minimal-example)
- [Query examples](#query-examples)
  - [Select queries](#select-queries)
  - [Update queries](#update-queries)
  - [Insert queries](#insert-queries)
  - [Delete queries](#delete-queries)

# Installation
```bash
npm install artbase
```

# Minimal example
```typescript
import ArtBase from 'artbase';

interface User {
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

let db = new ArtBase({
    host: 'localhost',
    port: 3306,
    user: "artbase",
    password: "XXXXXXXX",
    database: 'artbase_test',
});

let data = await db.select<User>(['name', 'email'], {id: 6}, 'user');
if(!data) console.log('No data found');
if(data) console.log(data); // returns User[]
```

# Query examples
For all examples, we assume that `User` interface is defined & we have a `db` instance of `ArtBase`.

```typescript
import ArtBase from 'artbase';

interface User {
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

const db = new ArtBase({
    host: 'localhost',
    port: 3306,
    user: "artbase",
    password: "XXXXXXXX",
    database: 'artbase_test',
    debug: true, // default undefined
});
```

## Select queries
```typescript
// Select all columns from table
let data = await db.select<User>(null, {id: 6}, 'user');
if(!data) console.log('No data found');
if(data) console.log(data); // returns User[]
```

## Update queries
```typescript
// Update a single row
let data = await db.update<User>({name: 'John Doe'}, {id: 6}, 'user');
if(!data) console.log('No data found');
if(data) console.log(data); // returns OkPacket
```

## Insert queries
```typescript
// Insert a single row
let data = await db.insert<User>({
  name: "Arthur",
  email: "artbase@example.com",
  isAdmin: true,
  created_at: new Date(),
}, "user");

if(!data) console.log('No data found');
if(data) console.log(data); // returns OkPacket
```

## Delete queries
```typescript
// Delete a single row
let data = await db.delete<User>({id: 6}, 'user');
if(!data) console.log('No data found');
if(data) console.log(data); // returns OkPacket
```
