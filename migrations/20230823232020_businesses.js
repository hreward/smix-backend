/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('businesses', function(table) {
      table.increments('id').primary();
      table.string('reference', 50).notNullable().unique();
      table.string('name', 100).notNullable();
      table.string('email', 100).notNullable();
      table.string('password', 200).notNullable();
      table.string('phone', 50).notNullable();
      table.string('registration_id', 100).nullable();
      table.string('logo', 200).nullable();
      table.string('country', 100).notNullable();
      table.string('state', 100).notNullable();
      table.string('city', 100).notNullable();
      table.string('address', 100).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('status', 20).nullable();
      table.string('created_by', 50).notNullable();
      table.string('approved_by', 50).nullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('businesses');
  };
  
