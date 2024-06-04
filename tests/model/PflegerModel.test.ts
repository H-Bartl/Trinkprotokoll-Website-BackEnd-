import { HydratedDocument } from "mongoose";
import {IPfleger, Pfleger} from "../../src/model/PflegerModel";
import { pathToFileURL } from "url";
import { rejects } from "assert";

let pfleger : HydratedDocument<IPfleger>;

beforeEach(async () => {
    pfleger = await Pfleger.create({name: "Hamza", password: "123ABC", admin: true});
    await pfleger.save()
})

test("PflegerModel richtigkeit testen", async () => {
    const pflegerErstellen = await Pfleger.create({
        name: "Abdel",
        password: "1234"
    })
    const pflegerErstellen2 = await Pfleger.create({
        name: "Jonas",
        password: "1234"
    })
    const pflegerFinden = await Pfleger.find();

    expect(pflegerErstellen._id).not.toBe(pfleger._id);

    expect(pflegerFinden.length).toBe(3);
    expect(pflegerErstellen.name).toBe("Abdel");
    expect(pflegerErstellen.password == "1234").toBeFalsy();
    expect(pflegerErstellen.admin).toBeFalsy;
    expect(pflegerErstellen2.password == pflegerErstellen.password).toBeFalsy();
})

test("PflegerModel richtigkeit testen2", async () => {

    const pflegerFinden = await Pfleger.find();

    expect(pflegerFinden.length).toBe(1);
    expect(pfleger.name).toBe("Hamza");
    expect(pfleger.admin).toBeTruthy;
})

test("Duplikat Testen",async () => {
    try {
        const pflegerErstellen = await Pfleger.create({
        name: "Hamza",
        password: "3342"
    })
    } catch (error) {
        expect(error).toBeTruthy()
    }

    // const pflegerErstellen = await Pfleger.create({
    //     name: "Hamza",
    //     password: "3342"
    // })

    // await expect(async () =>  await pflegerErstellen.save).rejects.toThrow(Error);
})

test("Name und Password required",async () => {
    
    try {
        const pflegerErstellen = await Pfleger.create({
        password: "231ewds",
    })
    } catch (error) {
        expect(error).toBeTruthy
    }

    
    try {
       const pflegerErstellen = await Pfleger.create({
        name: "Bla"
    }) 
    } catch (error) {
        expect(error).toBeTruthy
    }
})

test("updateOne und findOne",async () => {
    const pflegerErstellen = await Pfleger.create({
        name: "John Abrusi",
        password: "23001"
    })
    await pflegerErstellen.save();

    const p1 = await Pfleger.updateOne({name: "John Abrusi"}, {name: "John Abruzzi"}).exec();
    expect(p1.matchedCount).toBe(1)
    expect(p1.modifiedCount).toBe(1)

    const p2 = await Pfleger.findOne({name: "John Abruzzi"}).exec();
    expect(p2?.name).toBe("John Abruzzi");
})

