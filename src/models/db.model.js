const knexCon = require("knex").knex;
const configModule = require('../../config.acc');

// database connection credentials
const knex = knexCon({
	client: 'mysql',
	// version: '5.7',
	connection: {
		host : '127.0.0.1',
		port : 3306,
		user : process.env.DBUser,
		password : process.env.DBPass,
		database : process.env.DBName
	}
});

// runs unrunned migrations during CI/CD
async function migrateDB() {
	const config = configModule.getConfig();
	if (config[process.env.NODE_ENV].migrate) {
		try {
			console.error('Migrations started');
			await knex.migrate.latest();
			console.error('Migrations completed');
			
			config[process.env.NODE_ENV].migrate = false;
			configModule.updateConfig(config);
		} catch (error) {
			console.error(error);
		}
	} else {
		console.error('Migrations not needed')
	}
}

migrateDB();

module.exports = {knex};

  