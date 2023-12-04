/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('clients', function(table) {
    table.increments('id').primary();
    table.string('reference', 100).notNullable().unique();
    table.string('business_reference', 100).notNullable();
    table.string('email', 100).notNullable();
    table.string('name', 65).notNullable();
    table.string('sex', 8).nullable();
    table.string('phone', 15).nullable();
    table.string('address', 150).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('status', 35).notNullable().defaultTo('0');
    table.text('avatar').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('clients');
};

  
