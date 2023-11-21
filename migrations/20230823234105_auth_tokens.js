/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('auth_tokens', function(table) {
    table.increments('id').primary();
    table.string('token', 100).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('user_id', 100).notNullable();
    table.string('user_email', 100).notNullable();
    table.string('device_signature', 100).nullable();
    table.string('device_name', 50).notNullable();
    table.string('browser', 50).notNullable();
    table.string('status', 20).notNullable();
    table.foreign('user_email').references('email').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').withKeyName('authcode_useremail');
    table.foreign('user_id').references('uuid').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').withKeyName('authcode_userid');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('auth_tokens');
};

