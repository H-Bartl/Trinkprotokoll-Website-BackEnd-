// @ts-nocxheck

import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { createEintrag } from "../../src/services/EintragService";
import { ProtokollResource } from "../../src/Resources";
import { dateToString } from "../../src/services/ServiceHelper";
import { Types } from "mongoose";

let idBehrens: string
let idProtokoll: string

beforeEach(async () => {
    // create a pfleger
    const behrens = await createPfleger({ name: "Hofrat Behrens", password: "geheim", admin: false })
    idBehrens = behrens.id!;
    const protokoll = await createProtokoll({ patient: "H. Castorp", datum: `01.11.1912`, ersteller: idBehrens, public: true });
    idProtokoll = protokoll.id!;
})

test("/api/protokoll/:id/eintrage get, 5 Einträge", async () => {
    
    for (let i = 1; i <= 5; i++) {
        await createEintrag({ getraenk: "BHTee", menge: i * 10, protokoll: idProtokoll, ersteller: idBehrens })
    }
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(5);
});

test("/api/protokoll/:id/eintrage get, keine Einträge", async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
});

test("/api/protokoll/:id/eintrage get, falsche Protokoll-ID", async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/${idBehrens}/eintraege`);
    expect(response.statusCode).toBe(404);
});

test("/api/protokoll/alle get",async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/alle`)
    expect(response.statusCode).toBe(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0].patient).toBe("H. Castorp")
})

test("/api/protokoll/ post",async () => {
    let protResource: ProtokollResource= ({
        patient: "Toyota",
        datum: dateToString(new Date),
        ersteller: idBehrens,
        public: true
    })
    const testee = supertest(app);
    const response = await testee.post(`/api/protokoll/`).send(protResource)
    expect(response.statusCode).toBe(201)
    expect(response.body.gesamtMenge).toBe(0)
})

test("/api/protokoll/ post, Falsche Id",async () => {
    let protResource: ProtokollResource= ({
        patient: "Toyota",
        datum: dateToString(new Date),
        ersteller: idProtokoll,
        public: true
    })
    const testee = supertest(app);
    const response = await testee.post(`/api/protokoll/`).send(protResource)
    expect(response.statusCode).toBe(404)
})

test("/api/protokoll/:id get",async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/${idProtokoll}/`);
    expect(response.statusCode).toBe(200)
    expect(response.body.erstellerName).toBe("Hofrat Behrens")
    expect(response.body.gesamtMenge).toBe(0)
})

test("/api/protokoll/:id get",async () => {
    for (let i = 1; i <= 5; i++) {
        await createEintrag({ getraenk: "BHTee", menge: i * 10, protokoll: idProtokoll, ersteller: idBehrens })
    }
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/${idProtokoll}/`);
    expect(response.statusCode).toBe(200)
    expect(response.body.erstellerName).toBe("Hofrat Behrens")
    expect(response.body.gesamtMenge).toBe(150)
})

test("/api/protokoll/:id get, falsche Id",async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/${idBehrens}/`);
    expect(response.statusCode).toBe(404)
})

test("/api/protokoll/:id put",async () => {
    let protResource: ProtokollResource= ({
        id: idProtokoll,
        patient: "Toyota",
        datum: dateToString(new Date),
        ersteller: idBehrens,
        public: true
    })
    const testee = supertest(app);
    const response = await testee.put(`/api/protokoll/${idProtokoll}/`).send(protResource);
    expect(response.statusCode).toBe(200)
    expect(response.body.gesamtMenge).toBeUndefined
    expect(response.body.erstellerName).toBe("Hofrat Behrens")
})

test("/api/protokoll/:id put, falsche Id",async () => {
    let protResource: ProtokollResource= ({
        id: idBehrens,
        patient: "Toyota",
        datum: dateToString(new Date),
        ersteller: idBehrens,
        public: true
    })
    const testee = supertest(app);
    const response = await testee.put(`/api/protokoll/${protResource.id}`).send(protResource);
    expect(response.statusCode).toBe(404)
})

test("/api/protokoll/:id delete",async () => {
    const testee = supertest(app);
    const response = await testee.delete(`/api/protokoll/${idProtokoll}/`)
    expect(response.statusCode).toBe(204)
    expect(response.body).toBeNull
})

test("/api/protokoll/:id delete",async () => {
    const testee = supertest(app);
    const response = await testee.delete(`/api/protokoll/${idBehrens}`)
    expect(response.statusCode).toBe(404)
})