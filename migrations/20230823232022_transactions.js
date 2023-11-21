/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.increments('id').primary();
    table.string('reference', 50).notNullable();
    table.string('type', 50).notNullable();
    table.float('amount').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('sender_wallet', 100).notNullable();
    table.string('invoice_reference', 100).notNullable();
    table.string('channel', 50).nullable();
    table.string('narration', 100).notNullable();
    table.string('status', 20).notNullable();
    table.unique('reference');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
};

  
