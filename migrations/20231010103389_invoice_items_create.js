/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable('invoice_items', function(table) {
		table.increments('id').primary();
		table.string('reference', 100).notNullable().unique();
		table.string('business_reference', 50).notNullable();
		table.string('invoice_reference', 100).notNullable();
		table.string('serial_number', 20).notNullable();
		table.string('description', 200).notNullable();
        table.float('quantity').defaultTo(1);
		table.float('rate', 18, 2).notNullable();
        table.float('amount', 18, 2).defaultTo(0.00);
		table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('invoice_items');
};
