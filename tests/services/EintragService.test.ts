import { HydratedDocument, Types } from "mongoose";
import { IEintrag, Eintrag } from "../../src/model/EintragModel";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { createEintrag, deleteEintrag, getAlleEintraege, getEintrag, updateEintrag } from "../../src/services/EintragService";
import { EintragResource } from "../../src/Resources";


let pfleger : HydratedDocument<IPfleger>;
let pfleger2 : HydratedDocument<IPfleger>;
let protokoll : HydratedDocument<IProtokoll>;
let protokollClosed: HydratedDocument<IProtokoll>;
let eintrag : HydratedDocument<IEintrag>;
let eintrag2 : HydratedDocument<IEintrag>;
let eintrag3 : HydratedDocument<IEintrag>;
beforeEach(async () => {
    pfleger = await Pfleger.create({
        name: "Hamza",
        password: "2213",
        admin: true
    })

    pfleger2 = await Pfleger.create({
        name: "Mert",
        password: "4432",
        admin: true
    })

    protokoll = await Protokoll.create({
        patient: "Uri",
        datum: new Date,
        ersteller: pfleger._id
    })

    protokollClosed = await Protokoll.create({
        patient: "Goet",
        datum: new Date,
        ersteller: pfleger2._id,
        closed: true
    })

    eintrag = await Eintrag.create({
        getraenk: "Wasser",
        menge: 200,
        ersteller: pfleger._id,
        protokoll: protokoll._id
    })

    eintrag2 = await Eintrag.create({
        getraenk: "Cola",
        menge: 330,
        ersteller: pfleger2._id,
        protokoll: protokoll._id
    })

    eintrag3 = await Eintrag.create({
        getraenk: "Ayran",
        menge: 250,
        ersteller: pfleger._id,
        protokoll: protokoll._id
    })
})

test("getAlleEintraege testen",async () => {
    const alle = await getAlleEintraege(protokoll.id)
    expect(alle.length).toBe(3)
})

test("getAlleEintraege throws testen",async () => {
    await expect(getAlleEintraege("")).rejects.toThrow("Id wurde nicht angegeben!")

    await expect(getAlleEintraege(new Types.ObjectId().toString())).rejects.toThrow("Protokoll mit dieser Id wurde nicht gefunden!")
})

test("getAlleEintraege throws test",async () => {
    let protokoll2 = await Protokoll.create({
        patient: "Uri",
        datum: new Date,
        ersteller: new Types.ObjectId().toString()
    })

    await expect(getAlleEintraege(protokoll2.id)).rejects.toThrow("Pfleger mit dieser Id wurde nicht gefunden!")
})

test("getEintrag testen",async () => {
    const res = await getEintrag(eintrag.id);
    expect(res.getraenk).toBe("Wasser");
})

test("getEintrag testen throws",async () => {
    await expect(getEintrag(new Types.ObjectId().toString())).rejects.toThrow("Id wurde nicht gefunden!")
    let eintragBeispiel = await Eintrag.create({
        getraenk: "Fanta",
        menge: 200,
        ersteller: pfleger._id,
        protokoll: new Types.ObjectId()
    })
    await expect(getEintrag(eintragBeispiel.id)).rejects.toThrow("Protokoll nicht gefunden")
})

test("getEintrag testen throws Pfleger",async () => {
    let eintragBeispiel = await Eintrag.create({
        getraenk: "Fanta",
        menge: 200,
        ersteller: new Types.ObjectId(),
        protokoll: protokoll._id
    })
    await expect(getEintrag(eintragBeispiel.id)).rejects.toThrow("Pfleger nicht gefunden")

})

test("createEintrag testen",async () => {
    let eintragResource: EintragResource = {
        getraenk: "Cola",
        menge: 330,
        ersteller: pfleger2.id,
        protokoll: protokoll.id
    }
    const erstellt = await createEintrag(eintragResource);
    expect(erstellt.getraenk).toBe("Cola")
    const find = await getEintrag(erstellt.id!)
    expect(find.getraenk).toBe("Cola")
})

test("createEintrag testen mit throws ohne Pfleger",async () => {
    let ohnePflegerResource: EintragResource = {
        getraenk: "Cola",
        menge: 330,
        ersteller: protokoll.id,
        protokoll: protokoll.id
    }
    await expect(createEintrag(ohnePflegerResource)).rejects.toThrow(`No pfleger found with id ${ohnePflegerResource.ersteller}`)
})

test("createEintrag testen mit throws ohne Protokoll",async () => {
    let ohneProtokollResource: EintragResource = {
        getraenk: "Cola",
        menge: 330,
        ersteller: pfleger.id,
        protokoll: pfleger2.id
    }
    await expect(createEintrag(ohneProtokollResource)).rejects.toThrow(`No protokoll found with id ${ohneProtokollResource.protokoll}`)
})

test("createEintrag testen mit throws ohne Pfleger",async () => {
    let protokollClosedEintrag: EintragResource = {
        getraenk: "Cola",
        menge: 330,
        ersteller: pfleger.id,
        protokoll: protokollClosed.id
    }
    await expect(createEintrag(protokollClosedEintrag)).rejects.toThrow(`Protokoll ${protokollClosed.id} is already closed`)
})

test("updateEintrag testen",async () => {
    let eintragResource: EintragResource = {
        id: eintrag.id,
        getraenk: "Cola",
        menge: 330,
        ersteller: pfleger.id,
        protokoll: protokoll.id
    }
    await updateEintrag(eintragResource);
    const find = await Eintrag.findById(eintragResource.id);
    expect(find?.getraenk).toBe("Cola");
    expect(find?.menge).toBe(330)
})

test("updateEintrag testen mit throws",async () => {
    let eintragResource: EintragResource = {
        id: pfleger2.id,
        getraenk: "Cola",
        menge: 330,
        ersteller: pfleger.id,
        protokoll: protokoll.id
    }
    await expect(updateEintrag(eintragResource)).rejects.toThrow("Eintrag mit dieser Id wurde nicht gefunden!")
})

test("updateEintrag testen mit throws",async () => {
    let eintragResource: EintragResource = {
        id: eintrag.id,
        getraenk: "Cola",
        menge: 330,
        ersteller: pfleger.id,
        protokoll: new Types.ObjectId().toString()
    }
    await expect(updateEintrag(eintragResource)).rejects.toThrow("Protokoll nicht gefunden")
})

test("updateEintrag testen mit throws",async () => {
    let eintragResource: EintragResource = {
        id: eintrag.id,
        getraenk: "Cola",
        menge: 330,
        ersteller: new Types.ObjectId().toString(),
        protokoll: protokoll.id
    }
    await expect(updateEintrag(eintragResource)).rejects.toThrow("Pfleger nicht gefunden")
})

test("deleteEintrag testen",async () => {
    const eintrag2 = await Eintrag.create({
        getraenk: "Cola",
        menge: 330,
        ersteller: pfleger.id,
        protokoll: protokoll.id
    })
    await deleteEintrag(eintrag2.id);
    expect(await Eintrag.findOne(eintrag2._id)).toBeNull()
})

test("deleteEintrag testen mit createEintrag",async () => {
    let eintragResource: EintragResource = {
        id: new Types.ObjectId().toString(),
        getraenk: "Cola",
        menge: 330,
        ersteller: pfleger.id,
        protokoll: protokoll.id
    }
    const res = await createEintrag(eintragResource)
    const find = await Eintrag.find()
    expect(find.length).toBe(4)
    await deleteEintrag(res.id!)
    const find2 = await Eintrag.find()
    expect(find2.length).toBe(3)
})

test("deleteEintrag testen mit throws",async () => {
    let eintragResource: EintragResource = {
        id: pfleger2.id,
        getraenk: "Cola",
        menge: 330,
        ersteller: pfleger.id,
        protokoll: protokoll.id
    }
    await expect(deleteEintrag(eintragResource.id!)).rejects.toThrow("Id wurde nicht gefunden!")

    await expect(deleteEintrag("")).rejects.toThrow("Id gibt es nicht oder ist falsch!")
})