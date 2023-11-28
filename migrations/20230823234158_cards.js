/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cards', function(table) {
    table.increments('id').primary();
    table.string('reference', 100).notNullable();
    table.string('business_reference', 100).notNullable();
    table.string('invoice_reference', 100).notNullable();
    table.string('type', 50).notNullable();
    table.string('issuer', 150).notNullable();
    table.string('country', 100).notNullable();
    table.string('token', 100).notNullable();
    table.string('first_digits', 10).notNullable();
    table.string('last_digits', 10).notNullable();
    table.timestamp('expiry_date').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('status', 20).notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('cards');
};

  
