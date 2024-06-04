import { HydratedDocument, Types } from "mongoose";
import { PflegerResource } from "../../src/Resources";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { createPfleger, deletePfleger, getAllePfleger, updatePfleger } from "../../src/services/PflegerService";


let pfleger : HydratedDocument<IPfleger>;
let protokoll : HydratedDocument<IProtokoll>;
let eintrag : HydratedDocument<IEintrag>;
beforeEach(async () => {
    pfleger = await Pfleger.create({
        name: "Hamza",
        password: "2213",
        admin: true
    })

    protokoll = await Protokoll.create({
        patient: "Uri",
        datum: new Date,
        ersteller: pfleger._id
    })

    eintrag = await Eintrag.create({
        getraenk: "Wasser",
        menge: 200,
        ersteller: pfleger._id,
        protokoll: protokoll._id
    })
})

test("getAllePfleger testen",async () => {
    let pfleger2 = await Pfleger.create({
        name: "Mert",
        password: "2131"
    })

    let alle = await getAllePfleger();
    expect(alle.length).toBe(2)
    
})

test("createPfleger testen",async () => {
    let pflegerResource= {id: pfleger.id, name: "Mert", admin: false, password: "321"}
    let cPfleger = await createPfleger(pflegerResource)
    const find = await Pfleger.find()
    expect(find.length).toBe(2)
    expect(cPfleger.name).toBe("Mert")
    
})

test("updatePfleger testen",async () => {
    const pflegerResource: PflegerResource = {id: pfleger.id, name: "Mert", password: "321", admin: false}
    let res = await updatePfleger(pflegerResource)
    const updated = await Pfleger.findOne({name: "Mert"})
    expect(updated!.name).toBe("Mert")
    expect(updated!.id).toBe(pfleger.id)
})

test("updatePfleger Errors testen",async () => {
    // const pflegerResource: PflegerResource = {id: "", name: "Mert", password: "321", admin: false}
    // await expect(updatePfleger(pflegerResource)).rejects.toThrow("Keine Id oder falsche Id!")
    const pflegerResource2: PflegerResource = {id: undefined, name: "Mert", password: "321", admin: false}
    await expect(updatePfleger(pflegerResource2)).rejects.toThrow("Pfleger id nicht gefunden!")
})

test("deletePfleger",async () => {
    await expect(deletePfleger("")).rejects.toThrow("Id ist falsch eingegeben!")
    await expect(deletePfleger(new Types.ObjectId().toString())).rejects.toThrow("Id existiert nicht!")
})

test("deletePfleger testen 2",async () => {
    await deletePfleger(pfleger.id)

    expect(await Pfleger.findOne(pfleger._id)).toBeNull

    expect(await Protokoll.findOne(pfleger._id)).toBeNull
    
    expect(await Eintrag.findOne(pfleger._id)).toBeNull
})

