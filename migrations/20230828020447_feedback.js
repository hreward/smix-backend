/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable('feedbacks', (table)=>{
		
	table.increments('id').primary();
	table.string("reference", 100).notNullable();
	table.string("name", 50).notNullable();
	table.string("email", 50).notNullable();
	table.string("page_name", 50).notNullable();
	table.string("page_url", 100).notNullable();
	table.string("attachment", 100).nullable();
	table.text("message", 100).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('status', 11).nullable();
	table.unique('reference');
	});
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTable('feedbacks');
};
