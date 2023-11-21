/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable('auth_codes', function(table) {
	  table.increments('id').primary();
	  table.string('code', 50).notNullable();
	  table.string('user_email', 100).notNullable();
	  table.string('purpose', 50).notNullable();
	  table.datetime('date_generated').notNullable();
	  table.datetime('expiry_date').notNullable();
	  table.datetime('date_used').notNullable();
	  table.string('status', 20).notNullable();
	  table.unique('code');
	  table.foreign('user_email').references('email').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').withKeyName('fk_authcode_user_email');
	});
  };
  
  exports.down = function(knex) {
	return knex.schema.dropTable('auth_codes');
  };
  
