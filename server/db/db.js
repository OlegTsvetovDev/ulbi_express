const pgp = require("pg-promise")({});
const connection = `postgres://${process.env.PSG_LOGIN}:${process.env.PSG_PSWD}@localhost:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const db = pgp(connection);

module.exports = db;
