require("dotenv").config();

const {
    DB_CONNECTION,
    DB_HOST,
    DB_PORT,
    DB_DATABASE,
    DB_USERNAME,
    DB_PASSWORD,
} = process.env;

module.exports = {
    development: {
        client: DB_CONNECTION,
        connection: {
            database: DB_DATABASE,
            user: DB_USERNAME,
            password: DB_PASSWORD,
            host: DB_HOST,
            port: DB_PORT,
            timezone: "Asia/Tokyo",
        },
        pool: {
            min: 1,
            max: 10,
        },
        migrations: {
            directory: __dirname + "/src/database/migrations",
        },
        seeds: {
            directory: __dirname + "/src/database/seeds",
        },
    },

    staging: {
        client: "postgresql",
        connection: {
            database: "my_db",
            user: "username",
            password: "password",
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },

    production: {
        client: "postgresql",
        connection: {
            database: "my_db",
            user: "username",
            password: "password",
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },
};
