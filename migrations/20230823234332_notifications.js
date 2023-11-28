/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('notifications', function(table) {
    table.increments('id').primary();
    table.string('user_id', 100).notNullable();
    table.text('message').notNullable();
    table.boolean('read').defaultTo(false).notNullable();
    table.string('type', 50).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notifications');
};

  
