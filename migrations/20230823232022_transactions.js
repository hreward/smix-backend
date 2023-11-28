/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.increments('id').primary();
    table.string('reference', 50).notNullable().unique();
    table.string('business_reference', 50).notNullable();
    table.string('invoice_reference', 50).notNullable();
    table.string('client_reference', 50).notNullable();
    table.float('amount', 18, 2).notNullable();
    table.string('currency', 20).nullable();
    table.string('channel', 50).nullable();
    table.string('status', 20).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
};

  
