// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import { PflegerResource } from "../../src/Resources";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { Types } from "mongoose";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let pfleger1: PflegerResource;
let idPfleger1:string;
beforeEach(async () => {
    pfleger1 = await createPfleger({
        name: "Hamza",
        password: "Kdase4231?",
        admin: true
    });
    idPfleger1 = pfleger1.id!;
})

test("validation post ",async () => {
    await performAuthentication("Hamza", "Kdase4231?")
    let pflegerResource: PflegerResource = {
        name: "Honda Civic",
        password: "das2",
        admin: false
    }
    const testee = await supertestWithAuth(app)
    const created = await testee.post("/api/pfleger/").send(pflegerResource);
    expect(created.statusCode).toBe(400)
})

test("validation put ",async () => {
    await performAuthentication("Hamza", "Kdase4231?")
    let pflegerResource: PflegerResource = {
        id: new Types.ObjectId().toString(),
        name: "Supra mkvier",
        password: "Supramk4!!",
        admin: false
    }
    const testee = await supertestWithAuth(app)
    const created = await testee.put(`/api/pfleger/${idPfleger1}`).send(pflegerResource);
    expect(created.statusCode).toBe(400)
})

test("/api/pfleger/:id put",async () => {
    await performAuthentication("Hamza", "Kdase4231?")
    let pflegerResource:PflegerResource = ({
        id: idPfleger1,
        name: "Toyota",
        password: "Hamza6551!",
        admin: false
    })
    const testee = supertestWithAuth(app)
    const response = await testee.put(`/api/pfleger/fghjfgfgf`).send(pflegerResource)
    expect(response.statusCode).toBe(400)
})

test("validation delete",async () => {
    await performAuthentication("Hamza", "Kdase4231?")
    const testee = await supertestWithAuth(app)
    const created = await testee.delete(`/api/pfleger/2232`)
    expect(created.statusCode).toBe(400)
})