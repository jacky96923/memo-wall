# Database Setup

## Setup Credential for Database Connection

```sql
create database "memo-wall";
create role "memo-wall" with password 'memo-wall' superuser;
alter role "memo-wall" with login;
```

## Create Tables

```sql
create table memo (
  id serial primary key
, content text not null
, images text
, created_at timestamp not null default current_timestamp
, updated_at timestamp
);

create table "user" (
  id serial primary key
, username varchar(32) not null unique
, password varchar(2048) not null
);

delete from "user" where id = 3 or id = 4;

alter table "user" add constraint user_username_uniq unique(username);
```

## Update Table Schema

[2023-11-28 17:11]
Beeno: add column to distinguish sample data and user-generated-contents (UGC)

```sql
alter table "memo" add column is_sample boolean NOT NULL default false;
```

[2023-11-28 17:48]
Beeno: refactor memo.images -> image(id,memo_id,filename)

```sql
create table "image" (
  id serial primary key
, memo_id integer not null references memo(id)
, filename varchar(41) not null
);
```

```bash
npx ts-node migrate-memo-images.ts
```

```sql
alter table "memo" drop column "images";
```
