const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL || "postgres://postgres:1-1=Postgres@localhost:5432/shoppinglist";
const pool = new Pool({connectionString: connectionString});

module.exports = {
    pool:pool
}