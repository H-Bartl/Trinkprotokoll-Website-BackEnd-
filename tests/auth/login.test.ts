// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import { parseCookies } from "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";


/**
 * Eigentlich sind das hier sogar 5 Tests!
 */
test(`/api/login POST, Positivtest`, async () => {
    await createPfleger({ name: "John", password: "1234abcdABCD..;,.", admin: false })

    const testee = supertest(app);
    const loginData = { name: "John", password: "1234abcdABCD..;,." };
    const response = parseCookies(await testee.post(`/api/login`).send(loginData));
    expect(response).statusCode("2*")
    
    // added by parseCookies, similar to express middleware cookieParser
    expect(response).toHaveProperty("cookies"); // added by parseCookies
    expect(response.cookies).toHaveProperty("access_token"); // the cookie with the JWT
    const token = response.cookies.access_token;
    expect(token).toBeDefined();
        
    // added by parseCookies, array with raw cookies, i.e. with all options and value
    expect(response).toHaveProperty("cookiesRaw");
    const rawCookie = response.cookiesRaw.find(c=>c.name === "access_token");
    expect(rawCookie?.httpOnly).toBe(true);
    expect(rawCookie?.sameSite).toBe("None");
    expect(rawCookie?.secure).toBe(true);
 });

test("/api/login POST, Negativtest",async () => {
    const testee = supertest(app);
    const loginData = {name: "Hamza", password: "ldlsdaw"}
    const response = await testee.post(`/api/login/`).send(loginData)
    expect(response.statusCode).toBe(400)
})

test(`/api/login POST, Positivtest`, async () => {
    delete process.env.JWT_SECRET
    try{
    await createPfleger({ name: "John", password: "1234abcdABCD..;,.", admin: false })

    const testee = supertest(app);
    const loginData = { name: "John", password: "1234abcdABCD..;,." };
    const response = parseCookies(await testee.post(`/api/login`).send(loginData));
    expect(response).statusCode(500)
    } finally {
        process.env.JWT_SECRET = "HamZA.Secret42!"
    }
 });

test("/api/login POST, Negativtest auf 401",async () => {
    const testee = supertest(app);
    const loginData = {name: "Hamza", password: "falschesPassword42!"}
    const response = await testee.post(`/api/login/`).send(loginData)
    expect(response.statusCode).toBe(401)
})

test("/api/login GET, Postivtest",async () => {
    // await createPfleger({ name: "John", password: "1234abcdABCD..;,.", admin: false })
    // const testee = supertest(app);
    // const loginData = { name: "John", password: "1234abcdABCD..;,." };
    // const response = parseCookies(await testee.post(`/api/login`).send(loginData));
    // expect(response).statusCode("2*")

    await createPfleger({name: "Hamza", password: "richtigesPassword42!", admin: true});
    const testee = supertest(app);
    const loginData = {name: "Hamza", password: "richtigesPassword42!"}
    const erstellt = parseCookies(await testee.post(`/api/login`).send(loginData));
    expect(erstellt.statusCode).toBe(201)
    expect(erstellt.cookies.access_token).toBeDefined()




    const response = parseCookies(await testee.get(`/api/login`).set("Cookie",
    "access_token=" + erstellt.cookies.access_token))
    expect(response.statusCode).toBe(200)
})

test("/api/login GET, Negativtest",async () => {
    await createPfleger({name: "Hamza", password: "richtigesPassword42!", admin: true});
    const testee = supertest(app);
    const loginData = {name: "Hamza", password: "richtigesPassword42!"}
    const erstellt = parseCookies(await testee.post(`/api/login`).send(loginData));

    const response = parseCookies(await testee.get(`/api/login`).set("Cookie",
    "access_token=" + erstellt))
    expect(response.body).toBe(false)
})

test("/api/login Delete, Positivtest",async () => {
    await createPfleger({name: "Hamza", password: "richtigesPassword42!", admin: true});
    const testee = supertest(app);
    const loginData = {name: "Hamza", password: "richtigesPassword42!"}
    const erstellt = parseCookies(await testee.post(`/api/login`).send(loginData));

    const response = parseCookies(await testee.delete(`/api/login`).set("Cookie",
    "access_token=" + erstellt.cookies.access_token))
    expect(response.statusCode).toBe(204)
    expect(response.cookies.access_token).toBeUndefined()
})

test("/api/login Get, Negativtest false",async () => {
    await createPfleger({name: "Hamza", password: "richtigesPassword42!", admin: true});
    const testee = supertest(app);
    const loginData = {name: "Hamza", password: "richtigesPassword42!"}
    const response = parseCookies(await testee.post(`/api/login`).send(loginData));

    const deleted = parseCookies(await testee.delete(`/api/login/`).set("Cookie",
    "access_token=" + response.cookies.access_token))

    const response2 = parseCookies(await testee.get(`/api/login`).set("Cookie",
    "access_token=" + deleted.cookies.access_token))
    expect(response2.body).toBe(false)
})
