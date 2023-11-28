/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable('invoices', function(table) {
		table.increments('id').primary();
		table.string('reference', 100).notNullable().unique();
		table.string('business_reference', 50).notNullable();
		table.string('client_reference', 100).notNullable();
		table.string('currency', 20).notNullable();
		table.timestamp('due_date').notNullable();
		table.float('amount', 18, 2).notNullable();
        table.float('amount_paid', 18, 2).defaultTo(0.00);
        table.string('status').defaultTo('unpaid');
		table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('invoices');
};
