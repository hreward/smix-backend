/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('queues', function(table) {
      table.increments('id').primary();
      table.string('reference', 50).notNullable();
      table.string('item_reference', 50).notNullable();
      table.text('details').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('status', 20).nullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('queues');
  };
  
