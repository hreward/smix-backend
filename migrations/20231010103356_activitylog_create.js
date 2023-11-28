/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable('activity_logs', function(table) {
		table.increments('id').primary();
		table.string('reference', 100).notNullable().unique();
		table.string('business_reference', 50).notNullable();
		table.string('user', 100).notNullable();
		table.string('activity', 200).notNullable();
		table.integer('severity').notNullable();
		table.timestamp('created_at').defaultTo(knex.fn.now());
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('activity_logs');
};
