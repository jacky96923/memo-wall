import type { Knex } from "knex";

export async function up(knex: Knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments();
    table.string("name", 255);
    table.string("password", 65);
  });

  await knex.schema.createTable("memo", (table) => {
    table.increments();
    table.string("content", 255);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("update_at");
    table.boolean("is_sample").notNullable().defaultTo(false);
  });

  await knex.schema.createTable("image", (table) => {
    table.increments();
    table.integer("memo_id").unsigned();
    table.foreign("memo_id").references("memo.id");
    table.string("filename", 255);
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTable("image");
  await knex.schema.dropTable("memo");
  await knex.schema.dropTable("users");
}
