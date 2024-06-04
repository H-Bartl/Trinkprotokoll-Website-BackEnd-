import {IProtokoll, Protokoll} from "../../src/model/ProtokollModel";
import {IPfleger, Pfleger} from "../../src/model/PflegerModel";
import { IEintrag, Eintrag } from "../../src/model/EintragModel";
import { HydratedDocument } from "mongoose";

let pfleger : HydratedDocument<IPfleger>;
let protokoll : HydratedDocument<IProtokoll>;

beforeEach(async () => {
    pfleger= await Pfleger.create({name: "Hamza", password: "1234"})
    await pfleger.save();
    protokoll= await Protokoll.create({patient: "Uri Geller", datum: new Date, ersteller: pfleger._id})
    await protokoll.save();
})

test("allgemeine richtigkeit testen",async () => {
    const eintragErstellen = await Eintrag.create({
        getraenk: "Cola",
        menge: 200,
        ersteller: pfleger._id,
        protokoll: protokoll._id
    }) 
    await eintragErstellen.save();
    expect(eintragErstellen).toBeDefined();

    expect(eintragErstellen.getraenk).toBe("Cola")
    expect(eintragErstellen.protokoll).toBe(protokoll._id)
    expect(eintragErstellen.menge).toBe(200)
})

test("updateOne und findOne testen",async () => {
    const eintragErstellen = await Eintrag.create({
        getraenk: "Cola",
        menge: 200,
        ersteller: pfleger._id,
        protokoll: protokoll._id
    }) 
    await eintragErstellen.save();

    const p1 = await Eintrag.updateOne({getraenk: "Cola"}, {getraenk: "Wasser", menge: 330})
    expect(p1.matchedCount).toBe(1)
    expect(p1.modifiedCount).toBe(1)

    const p2 = await Eintrag.findOne({getraenk: "Wasser"})
    expect(p2?.menge).toBe(330);

})

test("deleteOne testen",async () => {
    const eintragErstellen = await Eintrag.create({
        getraenk: "Cola",
        menge: 200,
        ersteller: pfleger._id,
        protokoll: protokoll._id
    }) 
    await eintragErstellen.save();

    const eintragErstellen2 = await Eintrag.create({
        getraenk: "Wasser",
        menge: 330,
        ersteller: pfleger._id,
        protokoll: protokoll._id
    })
    await eintragErstellen2.save();

    const p1 = await Eintrag.deleteOne({getraenk: "Cola"})
    expect(p1.deletedCount).toBe(1)

    const p2 = await Eintrag.find()
    expect(p2.length).toBe(1);

    const p3 = await Eintrag.findOne({getraenk: "Cola"})
    expect(p3?.getraenk).toBe(undefined);
})