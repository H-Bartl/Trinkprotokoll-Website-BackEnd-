import {IProtokoll, Protokoll} from "../../src/model/ProtokollModel";
import {IPfleger, Pfleger} from "../../src/model/PflegerModel";
import { HydratedDocument } from "mongoose";

let pfleger : HydratedDocument<IPfleger>;
let pfleger2 : HydratedDocument<IPfleger>;

beforeEach(async () => {
    pfleger = await Pfleger.create({name: "Hamza", password: "1234"})
    await pfleger.save();
    pfleger2 = await Pfleger.create({name: "Mert", password: "2242"})
    await pfleger2.save();
})

test("allgemeine Tests für richtigkeit",async () => {
    const protokollErstellen = await Protokoll.create({
        patient: "Uri Gella",
        datum: "2024-04-16T14:00:00",
        ersteller: pfleger._id
    })
    await protokollErstellen.save();

    expect(protokollErstellen.patient).toBe("Uri Gella")
    expect(protokollErstellen.ersteller).toBe(pfleger._id);
    expect(protokollErstellen.public).toBeFalsy
    expect(protokollErstellen.closed).toBeFalsy
})

test("patient versucht Protokoll zu erstellen", async () => {
    const protokollErstellen = await Protokoll.create({
        patient: "Uri Geller",
        datum: "2024-04-16T14:00:00",
        ersteller: pfleger._id
    })
    await protokollErstellen.save()
    
    try {
        const protokollErstellen2 = await Protokoll.create({
            patient: "Hanna Geller",
            datum: "2024-04-16T14:30:00",
            ersteller: protokollErstellen._id
        })
    } catch (error) {
        expect(error).toBeTruthy();
    }
})

test("updateOne und findOne testen",async () => {
    const protokollErstellen = await Protokoll.create({
        patient: "Uri Geller",
        datum: "2024-04-16T14:00:00",
        ersteller: pfleger._id
    })
    await protokollErstellen.save()

    const p1 = await Protokoll.updateOne({patient: "Uri Geller"}, {patient: "Uri Gella", ersteller: pfleger2._id}).exec();
    expect(p1.matchedCount).toBe(1);
    expect(p1.modifiedCount).toBe(1);
    
    const p2 = await Protokoll.findOne({patient: "Uri Gella"}).exec()
    expect(p2?.patient).toBe("Uri Gella");

})