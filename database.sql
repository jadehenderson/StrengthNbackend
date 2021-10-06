
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
    userID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    pword VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL
);
