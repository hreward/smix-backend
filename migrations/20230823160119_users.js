/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
      table.increments('id').primary();
      table.string('uuid', 50).notNullable().unique();
      table.string('password', 255).notNullable().defaultTo('');
      table.string('email', 100).notNullable().unique();
      table.string('firstname', 65).notNullable();
      table.string('lastname', 65).notNullable();
      table.string('sex', 8).nullable();
      table.string('phone', 15).nullable();
      table.datetime('dob').nullable();
      table.string('address', 150).nullable();
      table.string('country', 50).nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('status', 35).notNullable().defaultTo('0');
      table.string('default_bid', 25).nullable();
      table.text('avatar').nullable();
    });
};
  
exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
  
