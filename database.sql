
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS userTOgroups;
drop trigger if exists boo ON users;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS organizations;
drop function if exists trig;





CREATE TABLE organizations(
    organizationID SERIAL PRIMARY KEY,
    orgname VARCHAR(255)
);
CREATE TABLE groups(
    groupID SERIAL PRIMARY KEY,
    loc VARCHAR(255),
    startdate timestamp,
    enddate timestamp,
    groupname VARCHAR(100),
    orgID INTEGER,
    FOREIGN KEY (orgID) REFERENCES organizations(organizationID)
);

CREATE TABLE messages(
    groupID INTEGER PRIMARY KEY,
    FOREIGN KEY (groupID) REFERENCES groups(groupID)
);
CREATE TABLE schedules(
    groupID INTEGER PRIMARY KEY,
    FOREIGN KEY (groupID) REFERENCES groups(groupID)
);

CREATE TABLE users(
    userID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    pword VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    orgID INTEGER,
    FOREIGN KEY (orgID) REFERENCES organizations(organizationID)
);



CREATE TABLE userTOgroups(
    userID uuid ,
    groupID INTEGER ,
    PRIMARY KEY(userID, groupID),
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (groupID) REFERENCES groups(groupID)
);


CREATE FUNCTION groupcomponents()
RETURNS trigger AS 
$$
    BEGIN
    INSERT INTO messages(groupID) VALUES(NEW.groupID);
    INSERT INTO schedules(groupID) VALUES(NEW.groupID);
    RETURN NEW;
    END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER onaddgroup
    AFTER INSERT
    ON groups
    FOR EACH ROW
    EXECUTE PROCEDURE groupcomponents();
    