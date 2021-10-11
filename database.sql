
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS userTOgroups;
drop trigger if exists boo ON users;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS organizations;
drop function if exists trig;








CREATE TABLE users(
    userID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    pword VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL
);

CREATE TABLE userTOgroups(
    userID uuid,
    groupIDS int[],
    FOREIGN KEY(userID) 
    REFERENCES users(userID)

);
CREATE TABLE groups(
    groupID SERIAL PRIMARY KEY,
    userIDS uuid[],
    name VARCHAR(100),
    organization VARCHAR(100)

);

CREATE TABLE organizations(
    organizationID SERIAL PRIMARY KEY,
    name VARCHAR(100),
    userIDS int[],
    groupIDS int[]
);


CREATE FUNCTION trig()
RETURNS trigger AS
$$
     BEGIN
     INSERT INTO userTOgroups VALUES(NEW.userID, '{}');
     RETURN NEW;
     END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER boo
  AFTER INSERT
  ON users
  FOR EACH ROW
  EXECUTE PROCEDURE trig();

