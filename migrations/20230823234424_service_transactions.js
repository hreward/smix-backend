/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('service_transactions', function(table) {
    table.increments('id').primary();
    table.string('reference', 50).notNullable();
    table.string('service_reference', 50).notNullable();
    table.string('service_id', 50).notNullable();
    table.string('type', 20).notNullable();
    table.float('amount').notNullable();
    table.string('device_fingerprint', 50).nullable();
    table.string('narration', 50).nullable();
    table.string('status', 50).notNullable();
    table.string('payment_type', 20).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('business_reference', 100).notNullable();
    table.string('invoice_reference', 100).notNullable();
    table.string('currency', 20).notNullable();
    table.string('ip', 20).nullable();
    table.float('amount_settled').notNullable();
    table.unique('service_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('service_transactions');
};

  
