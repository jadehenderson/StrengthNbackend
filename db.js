const { Pool } = require("pg");

const pool = new Pool({
	/*
    connectionString: "postgres://kvezvranwtsvve:8b4b8f46f3e66d07917e6a452fee4026e4b7099f1c5c5113eea6cf5c7c5c2e6e@ec2-34-199-209-37.compute-1.amazonaws.com:5432/d9dq3lf50s3ikq",
    */
	connectionString:
		"postgres://jbkmfhenxuaxzw:76061fe533487f4da33418c9d09cb850c6e0d807f8fc50009716af4b279b67ee@ec2-34-225-103-117.compute-1.amazonaws.com:5432/ddsrvjupshp99s",
	ssl: {
		rejectUnauthorized: false,
	},
});

module.exports = pool;
