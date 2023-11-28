// Update with your config settings.
require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : process.env.DBUser,
      password : process.env.DBPass,
      database : process.env.DBName
    }
  },

  staging: {
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : process.env.DBUser,
      password : process.env.DBPass,
      database : 'smixy_migrations'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : process.env.DBUser,
      password : process.env.DBPass,
      database : process.env.DBName
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
