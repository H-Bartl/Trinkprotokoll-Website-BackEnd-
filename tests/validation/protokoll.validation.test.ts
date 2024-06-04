// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import { PflegerResource, ProtokollResource } from "../../src/Resources";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { dateToString } from "../../src/services/ServiceHelper";
import { body } from "express-validator";

let pomfrey: PflegerResource
let fredsProtokoll: ProtokollResource

beforeEach(async () => {
    pomfrey = await createPfleger({
        name: "Poppy Pomfrey", password: "12345bcdABCD..;,.", admin: false
    });
    fredsProtokoll = await createProtokoll({
        patient: "Fred Weasly", datum: "01.10.2023",
        public: true, closed: false,
        ersteller: pomfrey.id!
    })
})

test("/api/protokoll/:id/eintrage get, falsche Protokoll-ID", async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/lsdls/eintraege`);
    expect(response.statusCode).toBe(400);
});

test("/api/protokoll GET, ungültige ID", async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/1234`)

    expect(response).toHaveValidationErrorsExactly({ status: "400", params: "id" })
})

test("/api/protokoll PUT, verschiedene ID (params und body)", async () => {
    const testee = supertest(app);
    // Hint: Gültige ID, aber für ein Protokoll ungültig!
    const invalidProtokollID = pomfrey.id;
    // Hint: Gebe hier Typ an, um im Objektliteral Fehler zu vermeiden!
    const update: ProtokollResource = { 
        ...fredsProtokoll, // Hint: Kopie von fredsProtokoll
        id: invalidProtokollID, // wir "überschreiben" die ID
        patient: "George Weasly" // und den Patienten
    }
    const response = await testee.put(`/api/protokoll/${fredsProtokoll.id}`).send(update);

    expect(response).toHaveValidationErrorsExactly({ status: "400", params: "id", body: "id" })
});

test("/api/protokoll, PUT constraints testen",async () => {
    const testee = supertest(app);
    const create = await createProtokoll({
        patient: "Mazda",
        datum: dateToString(new Date),
        ersteller: pomfrey.id!
    })
    const update: ProtokollResource = { 
        patient: "Fred Weasly",
        datum: "01.10.2023",
        id: create.id,
        ersteller: pomfrey.id!
    }
    const response = await testee.put(`/api/protokoll/${create.id}`).send(update);
    expect(response).toHaveValidationErrorsExactly({status: "400", body: ["patient","datum"]})
})

test("/api/protokoll post, patient mind Zeichen nicht eingehalten",async () => {
    const testee = supertest(app);
    const create: ProtokollResource = {
        patient: "",
        datum: dateToString(new Date),
        ersteller: pomfrey.id!
    }
    const response = await testee.post(`/api/protokoll/`).send(create);
    expect(response).toHaveValidationErrorsExactly({status: "400", body: "patient"})
})

test("/api/protokoll post, constraints datum und patient",async () => {
    const testee = supertest(app);
    const create: ProtokollResource = {
        patient: "Fred Weasly",
        datum: "01.10.2023",
        ersteller: pomfrey.id!
    }
    const response = await testee.post(`/api/protokoll/`).send(create);
    expect(response).toHaveValidationErrorsExactly({status: "400", body: ["patient", "datum"]})
})

test("/api/protokoll delete",async () => {
    const testee = supertest(app);
    const response = await testee.delete(`/api/protokoll/ldlsa`);
    expect(response).toHaveValidationErrorsExactly({status: "400", params: "id"})
})
