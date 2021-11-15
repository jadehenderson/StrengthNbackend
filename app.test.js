//const supertest = require("supertest")
//const {request} = supertest;
//const app = require("./app");
import app from './app'
import request from 'supertest'
import {randomBytes} from 'crypto'

let email = randomBytes(10).toString('hex') + "@gmail.com";
let orgName = randomBytes(5).toString('hex');
let jwt;
let groupID;

describe("POST /auth/register", () => {

    describe("Sign up with valid credentials", () => {
        test("Should respond with status code 201 and jwt token", async() => {
            const response = await request(app).post("/auth/register").send({
                fname: "pee",
                lname: "see",
                email: email,
                password: "geebees"
            });
            expect(response.statusCode).toBe(201);
            expect(response.body).toBeDefined();
        })
    })

    describe("Sign up with missing credential", () => {
        test("Should respond with status code 401", async() => {
            const response = await request(app).post("/auth/register").send({
                fname: "pee",
                lname: "",
                email: email,
                password: "geebees"
            });
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual("Missing Credential(s)");
        })
    })

    describe("Sign up with already used emai;", () => {
        test("Should respond with status code 401 and msg", async() => {
            const response = await request(app).post("/auth/register").send({
                fname: "pee",
                lname: "shs",
                email: email,
                password: "geebees"
            });
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual({msg: "User already exists."});
        })
    })
})

describe("POST /auth/login", () => {

    describe("login with valid credentials", () => {
        test("Should respond with status code 200 and jwt token", async() => {
            const response = await request(app).post("/auth/login").send({
                email: email,
                password: "geebees"
            });
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
            jwt = JSON.stringify(response.body);
        })
    })

    describe("login with missing credential", () => {
        test("Should respond with status code 401", async() => {
            const response = await request(app).post("/auth/login").send({
                email: "",
                password: "geebees"
            });
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual("Missing Credential(s)");
        })
    })

    describe("login with wrong password", () => {
        test("Should respond with status code 401 and msg", async() => {
            const response = await request(app).post("/auth/login").send({
                email: email,
                password: "geebee"
            });
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual({msg: "Password is not correct"});
        })
    })

    describe("login with non-existing email", () => {
        test("Should respond with status code 401 and msg", async() => {
            const response = await request(app).post("/auth/login").send({
                email: "zz@gmail.com",
                password: "geebees"
            });
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual({msg: "Email does not exist"});
        })
    })
})

describe("POST /admin/group", () => {
    describe("Create groups", () => {
        test("Should respond with status code 201 and msg", async() => {
            const response = await request(app).post("/admin/group").send({
                organization: orgName,
                groups : {
                    group1: ["lobe@gmail.com", "see@gmail.com", "justin@gmail.com"],
                    group2: ["peese@gmail.com", "justin@gmail.com", email]
                }
            });
            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual({msg: "Successfully made groups"});

        })
    })
})


describe("GET /user/home", () => {
    describe("Check authorization", () => {
        test("Should respond 403 and message", async() => {
            const response = await request(app).get("/user/home");
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({msg: "Not authorized"});
        })
    })

    describe("Check dashboard", () => {
        test("Should have all info", async() => {
           
            const response = await request(app).get("/user/home").set('token', jwt);
            const res = JSON.parse(response.body)
            groupID = res.groups[0].groupid;
            console.log(res);
            console.log("hey");
            expect(response.statusCode).toBe(200);
            expect(res).toHaveProperty('user', 'org', 'groups', 'messages', 'schedules');

        })
    })
})

describe("GET /user/messages", () => {
    describe("Check messages", () => {
        test("If properly returned", async() => {
            const response = await request(app).get("/user/messages").set('token', jwt);
            expect(response.statusCode).toBe(200);
            expect(typeof response.body).toEqual("object");
        })
    })

})

describe("GET /user/messages/:id", () => {
    describe("Check specific group messages", () => {
        test("If properly returned", async() => {
            const response = await request(app).get(`/user/messages/${groupID}`).set('token', jwt);
            expect(response.statusCode).toBe(200);
            expect(typeof response.body).toEqual("object");
        })
    })

    describe("Check specific group messages you are not part of", () => {
        test("Should return 401 and msg", async() => {
            const response = await request(app).get('/user/messages/1000').set('token', jwt);
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual({msg: "User does not have access to this group"});
        })
    })

})

describe("GET /user/schedules", () => {
    describe("Check schedules", () => {
        test("If properly returned", async() => {
            const response = await request(app).get("/user/schedules").set('token', jwt);
            expect(response.statusCode).toBe(200);
            expect(typeof response.body).toEqual("object");
        })
    })
    describe("Check specific group schedule you are not part of", () => {
        test("Should return 401 and msg", async() => {
            const response = await request(app).get('/user/schedules/1000').set('token', jwt);
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual({msg: "User does not have access to this group"});
        })
    })

})

