import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { PflegerResource } from "../../src/Resources";
import { protokollRouter } from "../../src/routes/protokoll";
import { Types } from "mongoose";
import { createProtokoll } from "../../src/services/ProtokollService";
import { dateToString } from "../../src/services/ServiceHelper";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let idPfleger1:string;
let idPfleger2:string;
let idProtokoll1:string;

beforeEach(async () => {
    const pfleger1 = await createPfleger({
        name: "Hamza", password: "Hamza6551!", admin: true
    })
    idPfleger1 = pfleger1.id!;
    const protokoll1 = await createProtokoll({
        patient: "Mazda", datum: dateToString(new Date), ersteller: idPfleger1, public: true
    })
    idProtokoll1 = protokoll1.id!;
    const pfleger2 = await createPfleger({
        name: "Mert", password: "3da241", admin: false
    })
    idPfleger2 = pfleger2.id!;
    const pfleger3 = await createPfleger({
        name: "Nissan", password: "34sdasdw", admin: false
    })
})

test("/api/pfleger/alle get, 3 pfleger",async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/pfleger/alle`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(3);
    expect(response.body[0].name).toBe("Hamza")
    expect(response.body[0].password).toBeUndefined()
})

test("/api/pfleger/ post",async () => {
    await performAuthentication("Hamza", "Hamza6551!")
    let pflegerResource:PflegerResource = ({
        name: "Toyota",
        password: "Hamza6551!",
        admin: false
    })
    const testeeAuth = supertestWithAuth(app)
    const response = await testeeAuth.post(`/api/pfleger`).send(pflegerResource)
    
    expect(response.statusCode).toBe(201)
    expect(response.body.password).toBeUndefined()
    expect(response.body.name).toBe("Toyota")
    expect(response.body.admin).toBeFalsy()
})

test("/api/pfleger/ post, negativ Test duplicate",async () => {
    await performAuthentication("Hamza", "Hamza6551!")
    let pflegerResource:PflegerResource = ({
        name: "Hamza",
        password: "Hamza6551!",
        admin: false
    })
    const testee = supertestWithAuth(app)
    const response = await testee.post(`/api/pfleger`).send(pflegerResource)
    expect(response.statusCode).toBe(404)
})

test("/api/pfleger/ post",async () => {
    await performAuthentication("Hamza", "Hamza6551!")
    const testee = supertestWithAuth(app)
    const response = await testee.post(`/api/pfleger/`)
    expect(response.statusCode).toBe(400)
})

test("/api/pfleger/:id put",async () => {
    await performAuthentication("Hamza", "Hamza6551!")
    let pflegerResource:PflegerResource = ({
        id: idPfleger1,
        name: "Toyota",
        password: "Hamza6551!",
        admin: false
    })
    const testee = supertestWithAuth(app)
    const response = await testee.put(`/api/pfleger/${idPfleger1}/`).send(pflegerResource)
    expect(response.statusCode).toBe(200)
    expect(response.body.name).toBe("Toyota")
    expect(response.body.password).toBeUndefined()
    expect(response.body.admin).toBeFalsy()
})

test("/api/pfleger/:id put",async () => {
    await performAuthentication("Hamza", "Hamza6551!")

    let falseId = new Types.ObjectId().toString()
    let pflegerResource:PflegerResource = ({
        id: idProtokoll1,
        name: "Toyota",
        password: "Hamza6551!",
        admin: false
    })
    const testee = supertestWithAuth(app)
    const response = await testee.put(`/api/pfleger/${pflegerResource.id}`).send(pflegerResource)
    expect(response.statusCode).toBe(404)
})

test("/api/pfleger/:id put",async () => {
    await performAuthentication("Hamza", "Hamza6551!")

    let pflegerResource:PflegerResource = ({
        id: idPfleger1,
        name: "Toyota",
        password: "Hamza6551!",
        admin: false
    })
    const testee = supertestWithAuth(app)
    const response = await testee.put(`/api/pfleger/${idPfleger2}`).send(pflegerResource)
    expect(response.statusCode).toBe(400)
    const response2 = await testee.put(`/api/pfleger`)
    expect(response2.statusCode).toBe(404)
})

test("/api/pfleger/:id delete",async () => {
    await performAuthentication("Hamza", "Hamza6551!")
    const testee = supertestWithAuth(app)
    const response = await testee.delete(`/api/pfleger/${idPfleger1}/`)
    expect(response.statusCode).toBe(204)
})

test("/api/pfleger/:id delete, Ohne Id",async () => {
    const testee = supertest(app)
    const response = await testee.delete(`/api/pfleger`)
    expect(response.statusCode).toBe(404)
})

test("/api/pfleger/:id delete, Falsche Id",async () => {
    await performAuthentication("Hamza", "Hamza6551!")
    let falseId = new Types.ObjectId().toString()
    const testee = supertestWithAuth(app)
    const response = await testee.delete(`/api/pfleger/${falseId}/`)
    expect(response.statusCode).toBe(404)
})
