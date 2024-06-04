import { HydratedDocument, Types } from "mongoose";
import { PflegerResource } from "../../src/Resources";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { login } from "../../src/services/AuthenticationService";
import { createPfleger } from "../../src/services/PflegerService";

let pfleger : HydratedDocument<IPfleger>;
let pfleger2: HydratedDocument<IPfleger>;
let protokoll : HydratedDocument<IProtokoll>;
let eintrag : HydratedDocument<IEintrag>;
beforeEach(async () => {
    pfleger = await Pfleger.create({
        name: "Hamza",
        password: "2213",
        admin: true
    })

    pfleger2 = await Pfleger.create({
        name: "Mert",
        password: "2341",
        admin: false
    })
    
})

test("login testen 1",async () => {
    expect(await login("", "pw")).toBeFalsy
    expect(await login("Hamza", "")).toBeFalsy
})

test("login testen",async () => {
    let testPfleger = await Pfleger.create({
        name: "Harry",
        password: "de32",
        admin: false
    })
    let res = await login("Harry", "de32");
    expect(res).toEqual({id: testPfleger.id, role: "u"})
})

test("login testen user",async () => {
    expect(await login(pfleger2.name, "2341")).toEqual({
        id: pfleger2.id,
        role: "u"
    })
})

test("login testen admin",async () => {
    expect(await login("Hamza", "2213")).toEqual({
        id: pfleger.id,
        role: "a"
    })
})

test("login mit anderen Passwort",async () => {
    expect(await login(pfleger.name, pfleger2.password)).toBeFalsy
})

test("login pfleger nicht gefunden",async () => {
    expect(await login("Ole", pfleger.password)).toBeFalsy
})

test("login name nicht gefunden",async () => {
    expect(await login("", "232")).toBeFalsy
})

test("login ",async () => {
    expect(await login("Hamza", "lldls")).toBeFalsy
})