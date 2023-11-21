/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('bank_accounts', function(table) {
    table.increments('id').primary();
    table.string('reference', 50).notNullable();
    table.string('business_reference', 50).notNullable();
    table.string('bank_name', 50).notNullable();
    table.string('bank_code', 20).notNullable();
    table.string('account_name', 50).notNullable();
    table.string('account_number', 20).notNullable();
    table.string('status', 20).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('bank_accounts');
};

  
