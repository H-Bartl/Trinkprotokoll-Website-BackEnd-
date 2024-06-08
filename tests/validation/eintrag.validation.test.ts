import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import { createPfleger } from "../../src/services/PflegerService";
import { EintragResource, PflegerResource, ProtokollResource } from "../../src/Resources";
import { createProtokoll } from "../../src/services/ProtokollService";
import { dateToString } from "../../src/services/ServiceHelper";
import { createEintrag } from "../../src/services/EintragService";
import app from "../../src/app";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let pfleger1: PflegerResource;
let idPfleger1: string;

let protokoll1: ProtokollResource;
let idProtokoll1: string;

let eintrag1: EintragResource;
let idEintrag1: string;

beforeEach(async () => {
    pfleger1 = await createPfleger({
        name: "Hamza",
        password: "Kdase4231?",
        admin: true
    });
    idPfleger1 = pfleger1.id!;

    protokoll1 = await createProtokoll({
        patient: "Mert",
        datum: dateToString(new Date),
        ersteller: idPfleger1
    })
    idProtokoll1 = protokoll1.id!;

    eintrag1 = await createEintrag({
        getraenk: "Cola",
        menge: 200,
        ersteller: idPfleger1,
        protokoll: idProtokoll1
    })
    idEintrag1 = eintrag1.id!;
})

test("/api/eintrag GET, ungültige ID", async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/eintrag/1234`)

    expect(response).toHaveValidationErrorsExactly({ status: "400", params: "id" })
})

test("/api/eintrag POST",async () => {
    await performAuthentication("Hamza", "Kdase4231?")
    const testee = supertestWithAuth(app);
    
    const create: EintragResource = {
        getraenk: "",
        menge: 200,
        ersteller: idPfleger1,
        protokoll: idProtokoll1
    }

    const response = await testee.post(`/api/eintrag/`).send(create);
    expect(response).toHaveValidationErrorsExactly({status: "400", body: "getraenk"})
})

test("/api/eintrag POST, closed Protokoll error",async () => {
    await performAuthentication("Hamza", "Kdase4231?")
    const testee = supertestWithAuth(app)
    const closedProt = await createProtokoll({
        patient: "Benz", 
        datum: dateToString(new Date),
        ersteller: idPfleger1,
        public: true,
        closed: true
    })

    const create: EintragResource = {
        getraenk: "Cola",
        menge: 200,
        ersteller: idPfleger1,
        protokoll: closedProt.id!
    }
    const response = await testee.post(`/api/eintrag/`).send(create);
    expect(response).toHaveValidationErrorsExactly({status: "400", body: "closed"})
})

test("/api/protokoll PUT, verschiedene ID (params und body)", async () => {
    await performAuthentication("Hamza", "Kdase4231?")
    const testee = supertestWithAuth(app);

    const invalidID = pfleger1.id;
    
    const update: EintragResource = {
        ...eintrag1,
        id: invalidID
    }
    const response = await testee.put(`/api/eintrag/${eintrag1.id}`).send(update);

    expect(response).toHaveValidationErrorsExactly({ status: "400", params: "id", body: "id" })
});

test("/api/protokoll DELETE",async () => {
    await performAuthentication("Hamza", "Kdase4231?")
    const testee = supertestWithAuth(app)
    const response = await testee.delete(`/api/eintrag/lslsd/`);
    expect(response).toHaveValidationErrorsExactly({status: "400", params: "id"})
})