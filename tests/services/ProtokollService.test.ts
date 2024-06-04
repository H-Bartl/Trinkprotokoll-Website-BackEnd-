import { HydratedDocument, Types } from "mongoose";
import { PflegerResource, ProtokollResource } from "../../src/Resources";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { createProtokoll, deleteProtokoll, getAlleProtokolle, getProtokoll, updateProtokoll } from "../../src/services/ProtokollService";
import { dateToString } from "../../src/services/ServiceHelper";


let pfleger : HydratedDocument<IPfleger>;
let pfleger2 : HydratedDocument<IPfleger>;
let protokoll : HydratedDocument<IProtokoll>;
let protokoll2: HydratedDocument<IProtokoll>;
let eintrag : HydratedDocument<IEintrag>;
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
        ersteller: pfleger._id,
        gesamtMenge: 0
    })

    eintrag = await Eintrag.create({
        getraenk: "Wasser",
        menge: 200,
        ersteller: pfleger._id,
        protokoll: protokoll._id
    })
})

test("getProtokoll testen",async () => {
    const getProt = await getProtokoll(protokoll.id)
    expect(getProt.patient).toBe("Uri")
    expect(getProt.erstellerName).toBe("Hamza")
})

test("getProtokoll throws testen",async () => {
    let prot = await Protokoll.create({
        patient: "Nissan",
        datum: new Date,
        ersteller: new Types.ObjectId(),
        gesamtMenge: 0
    })
    await expect(getProtokoll(prot.id)).rejects.toThrow("Pfleger wurde nicht gefunden")
    
    let prot2 = await Protokoll.create({
        id: new Types.ObjectId(),
        patient: "Nissan",
        datum: new Date,
        ersteller: pfleger._id
    })
})

test("getProtokoll gesamtmenge testen",async () => {
    const prot = await Protokoll.create({
        patient: "Toyota",
        datum: new Date,
        ersteller: pfleger._id,
        gesamtMenge: 0
    })
    const eintrag2 = await Eintrag.create({
        getraenk: "Fanta",
        menge: 330,
        ersteller: pfleger._id,
        protokoll: prot.id
    })
    const eintrag3 = await Eintrag.create({
        getraenk: "Wasser",
        menge: 270,
        ersteller: pfleger._id,
        protokoll: prot.id
    })

    const getProt = await getProtokoll(prot.id);
    expect(getProt.gesamtMenge).toBe(600)
})

test("getProtokoll testen throws Error",async () => {
    await expect(getProtokoll(pfleger.id)).rejects.toThrow("Ein Protokoll mit dieser id wurde nicht gefunden!")
})

test("createProtokoll testen",async () => {
    const protokollResource: ProtokollResource = {
        patient: "Löwe",
        datum: dateToString(new Date),
        public: true,
        closed: false,
        ersteller: pfleger.id.toString(),
        updatedAt: dateToString(new Date)
    }

    const createProt = await createProtokoll(protokollResource)
    expect(createProt.patient).toBe("Löwe")
})

test("createProtokoll testen throws",async () => {
    const protokollResource: ProtokollResource = {
        patient: "Löwe",
        datum: dateToString(new Date),
        public: true,
        closed: false,
        ersteller: new Types.ObjectId().toString(),
        updatedAt: dateToString(new Date)
    }

    await expect(createProtokoll(protokollResource)).rejects.toThrow("Pfleger wurde nicht gefunden!")
})

test("createProtokoll throw constraints error",async () => {
    const protokollResource: ProtokollResource = {
        patient: "Löwe",
        datum: dateToString(new Date),
        public: true,
        closed: false,
        ersteller: pfleger.id.toString(),
        updatedAt: dateToString(new Date)
    }
    const protokollResource2: ProtokollResource = {
        patient: "Löwe",
        datum: dateToString(new Date),
        public: true,
        closed: false,
        ersteller: pfleger.id.toString(),
        updatedAt: dateToString(new Date)
    }

    await createProtokoll(protokollResource)
    await expect(createProtokoll(protokollResource2)).rejects.toThrow("Es gibt bereits ein Protokoll mit diesem Patienten mit diesem Datum!")
})

test("updateProtokoll testen",async () => {
    const protokollResource: ProtokollResource = {
        id: protokoll.id,
        patient: "Löwe",
        datum: dateToString(new Date),
        public: true,
        closed: false,
        ersteller: pfleger.id.toString(),
        updatedAt: dateToString(new Date)
    }

    const updated = await updateProtokoll(protokollResource);
    expect(updated.patient).toBe("Löwe")
})

test("updateProtokoll testen throws Error bei constraint",async () => {
    const prot2 = await Protokoll.create({
        patient: "Supra",
        datum: new Date("2024-03-03"),
        ersteller: pfleger.id
    })
    const protokollResource: ProtokollResource = {
        patient: "Supra",
        datum: dateToString(prot2.datum),
        public: true,
        closed: false,
        ersteller: pfleger.id.toString(),
        updatedAt: dateToString(new Date)
    }

    await expect(updateProtokoll(protokollResource)).rejects.toThrow("Es gibt bereits ein Protokoll mit diesem Patienten mit diesem Datum!")
})

test("updateProtokoll findbyid error throw",async () => {
    const protokollResource: ProtokollResource = {
        id: pfleger.id,
        patient: "Polo",
        datum: dateToString(new Date),
        public: true,
        closed: false,
        ersteller: pfleger.id.toString(),
        updatedAt: dateToString(new Date)
    }
    await expect(updateProtokoll(protokollResource)).rejects.toThrow("Es gibt kein Protokoll die zu dieser id passt")
})

test("updateProtokoll findbyid error throw",async () => {
    const prot = await Protokoll.create({
        patient: "Greg",
        datum: new Date,
        public: true,
        closed: false,
        ersteller: protokoll.id
    })
    const protokollResource: ProtokollResource = {
        id: prot.id,
        patient: "Polo",
        datum: dateToString(new Date),
        public: true,
        closed: false,
        ersteller: protokoll.id,
        updatedAt: dateToString(new Date)
    }
    await expect(updateProtokoll(protokollResource)).rejects.toThrow("Pfleger wurde nicht gefunden")
})

test("deleteProtokolle testen",async () => {
    const protokoll2 = await Protokoll.create({
        patient: "Löwe",
        datum: new Date,
        ersteller: pfleger._id,
        public: true
    })

    await deleteProtokoll(protokoll2.id)
    expect(await Protokoll.findOne(protokoll2._id)).toBeNull
})

test("deleteProtokoll testen mit Eintrag",async () => {
    const protokoll2 = await Protokoll.create({
        patient: "Löwe",
        datum: new Date,
        ersteller: pfleger._id,
        public: true
    })

    const eintrag2 = await Eintrag.create({
        getraenk: "Wasser",
        menge: 200,
        ersteller: pfleger._id,
        protokoll: protokoll2._id
    })

    await deleteProtokoll(protokoll2.id)
    expect(await Protokoll.findOne(protokoll2._id)).toBeNull()
    expect(await Eintrag.findOne(protokoll2._id)).toBeNull()
})

test("deleteProtokolle testen throws Error id ist falsch", async () => {
    await expect(deleteProtokoll(pfleger.id)).rejects.toThrow("Id wurde nicht gefunden!")
})

test("getAlleProtokolle testen",async () => {
    const protokoll2 = await Protokoll.create({
        patient: "Löwe",
        datum: new Date,
        ersteller: pfleger._id,
        public: true
    })
    const protokoll3 = await Protokoll.create({
        patient: "Paul",
        datum: new Date,
        ersteller: pfleger._id
    })
    const protokoll4 = await Protokoll.create({
        patient: "Prada",
        datum: new Date,
        ersteller: pfleger2._id,
        public:true
    })
    const getAlle = await getAlleProtokolle(pfleger.id);
    expect(getAlle.length).toBe(4)
})

test("getAlleProtokolle gesamtmenge richtig",async () => {
    const protokoll2 = await Protokoll.create({
        patient: "Löwe",
        datum: new Date,
        ersteller: pfleger._id,
        public: true
    })
    const protokoll3 = await Protokoll.create({
        patient: "Paul",
        datum: new Date,
        ersteller: pfleger._id
    })

    const eintrag2 = await Eintrag.create({
        getraenk: "Fanta",
        menge: 200,
        ersteller: pfleger.id,
        protokoll: protokoll2.id
    })
    const eintrag3 = await Eintrag.create({
        getraenk: "Espresso",
        menge: 50,
        ersteller: pfleger.id,
        protokoll: protokoll2.id
    })

    const eintrag4 = await Eintrag.create({
        getraenk: "Espresso",
        menge: 75,
        ersteller: pfleger.id,
        protokoll: protokoll3.id
    })

    const eintrag5 = await Eintrag.create({
        getraenk: "Wasser",
        menge: 550,
        ersteller: pfleger.id,
        protokoll: protokoll3.id
    })

    const getAlle = await getAlleProtokolle(pfleger.id);
    expect(getAlle.length).toBe(3);
    expect(getAlle[0].gesamtMenge).toBe(200)
    expect(getAlle[0].erstellerName).toBe("Hamza")
    expect(getAlle[0].ersteller).toBe(pfleger.id)
    expect(getAlle[1].gesamtMenge).toBe(250)
    expect(getAlle[1].erstellerName).toBe("Hamza")
    expect(getAlle[2].gesamtMenge).toBe(625)
    expect(getAlle[1].erstellerName).toBe("Hamza")
})

test("createProtokoll und getProtokoll konsistent",async () => {
    let protResource:ProtokollResource = {
        patient: "Nismo", datum: dateToString(new Date), ersteller: pfleger.id
    }
    const createProt = await createProtokoll(protResource)
    const getProt = await getProtokoll(createProt.id!);
    expect(getProt.patient).toBe("Nismo")
})