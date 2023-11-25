/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('auth_tokens', function(table) {
    table.increments('id').primary();
    table.string('token', 100).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('business_reference', 100).notNullable();
    table.string('business_email', 100).notNullable();
    table.string('device_signature', 100).nullable();
    table.string('device_name', 50).notNullable();
    table.string('browser', 50).notNullable();
    table.string('status', 20).notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('auth_tokens');
};

