import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { dateToString } from "../../src/services/ServiceHelper";
import { createEintrag } from "../../src/services/EintragService";
import { EintragResource } from "../../src/Resources";


let idPfleger1:string;
let idProtokoll1:string;
let idEintrag1:string;

beforeEach(async () => {
    const pfleger1 = await createPfleger({
        name: "Hamza", password: "3421", admin: true
    })
    idPfleger1 = pfleger1.id!;
    const protokoll1 = await createProtokoll({
        patient: "Mazda", datum: dateToString(new Date), ersteller: idPfleger1, public: true
    })
    idProtokoll1 = protokoll1.id!;
    const pfleger2 = await createPfleger({
        name: "Mert", password: "3da241", admin: false
    })

    const pfleger3 = await createPfleger({
        name: "Nissan", password: "34sdasdw", admin: false
    })

    const eintrag1 = await createEintrag({
        getraenk: "Wasser",
        menge: 200,
        ersteller: idPfleger1,
        protokoll: idProtokoll1
    })
    idEintrag1 = eintrag1.id!;
})

test("/api/eintrag/ post",async () => {
    let eintragResource: EintragResource = ({
        getraenk: "Cola",
        menge: 330,
        ersteller: idPfleger1,
        protokoll: idProtokoll1
    })
    const testee = supertest(app);
    const response = await testee.post(`/api/eintrag/`).send(eintragResource)
    expect(response.statusCode).toBe(201)
    expect(response.body.erstellerName).toBe("Hamza")
})

test("/api/eintrag/ post, negativ test",async () => {
    let eintragResource: EintragResource = ({
        getraenk: "Cola",
        menge: 330,
        ersteller: idProtokoll1,
        protokoll: idProtokoll1
    })
    const testee = supertest(app);
    const response = await testee.post(`/api/eintrag/`).send(eintragResource)
    expect(response.statusCode).toBe(404)
})

test("/api/eintrag/:id get",async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/eintrag/${idEintrag1}/`)
    expect(response.statusCode).toBe(200)
    expect(response.body.erstellerName).toBe("Hamza")
})

test("/api/eintrag/:id get, falsche id",async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/eintrag/${idPfleger1}/`)
    expect(response.statusCode).toBe(404)
})

test("/api/eintrag/:id put",async () => {
    let eintragResource: EintragResource = ({
        id: idEintrag1,
        getraenk: "Cola",
        menge: 330,
        ersteller: idPfleger1,
        protokoll: idProtokoll1
    })
    const testee = supertest(app);
    const response = await testee.put(`/api/eintrag/${idEintrag1}/`).send(eintragResource)
    expect(response.statusCode).toBe(200)
    expect(response.body.erstellerName).toBe("Hamza")
    expect(response.body.getraenk).toBe("Cola")
})

test("/api/eintrag/:id put, negativ testen",async () => {
    let eintragResource: EintragResource = ({
        id: idPfleger1,
        getraenk: "Cola",
        menge: 330,
        ersteller: idPfleger1,
        protokoll: idProtokoll1
    })
    const testee = supertest(app);
    const response = await testee.put(`/api/eintrag/${idPfleger1}/`).send(eintragResource)
    expect(response.statusCode).toBe(404)
})

test("/api/eintrag/:id delete",async () => {
    const testee = supertest(app)
    const response = await testee.delete(`/api/eintrag/${idEintrag1}/`)
    expect(response.statusCode).toBe(204)
    expect(response.body).toBeNull
})

test("/api/eintrag/:id delete, negativ tests falsche Id",async () => {
    const testee = supertest(app)
    const response = await testee.delete(`/api/eintrag/${idPfleger1}`)
    expect(response.statusCode).toBe(404)
})