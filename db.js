const {Pool} = require("pg");

const pool = new Pool({
    user: 'kvezvranwtsvve',
    host: 'ec2-34-199-209-37.compute-1.amazonaws.com',
    database: 'd9dq3lf50s3ikq',
    password: '8b4b8f46f3e66d07917e6a452fee4026e4b7099f1c5c5113eea6cf5c7c5c2e6e',
    port: 5432,
});

module.exports = pool;
