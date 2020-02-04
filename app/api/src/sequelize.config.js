module.exports = {
    development: {
        "username": process.env.DATABASE_USER,
        "password": process.env.DATABASE_PASSWORD,
        "database": process.env.DATABASE_NAME,
        "host": process.env.DATABASE_HOST,
        "port": process.env.DATABASE_PORT,
        "dialect": "postgres",
        // "ssl": true,
        // "dialectOptions": {
        //     "ssl": true
        // },
    },
    production: {
        "username": process.env.DATABASE_USER,
        "password": process.env.DATABASE_PASSWORD,
        "database": process.env.DATABASE_NAME,
        "host": process.env.DATABASE_HOST,
        "port": process.env.DATABASE_PORT,
        "dialect": "postgres",
        // "ssl": true,
        // "dialectOptions": {
        //     "ssl": true
        // },
    },
};
