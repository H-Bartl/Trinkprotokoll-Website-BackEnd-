import { HydratedDocument } from "mongoose";
import {IPfleger, Pfleger} from "../../src/model/PflegerModel";
import { pathToFileURL } from "url";
import { rejects } from "assert";
import bcrypt from "bcryptjs";

 test("password wird gehasht",async () => {
    const pfleger = new Pfleger({
        name: "Hamza",
        password: "1234"
    })
    expect(pfleger.password).toBe("1234");
    await pfleger.save();
    expect(pfleger.password).not.toBe("1234");
 })

 test("isCorrectPassword negativ test",async () => {
    const pfleger = new Pfleger({
        name: "Hamza",
        password: "1234"
    })
    try {
        expect(await pfleger.isCorrectPassword(await pfleger.password)).toBe("1234")
    } catch (error) {
        expect(error).toBeTruthy();
    }
 })

 test("isCorrectPassword",async () => {
    const pfleger = Pfleger.create({
        name: "Hamza",
        password: "1234"
    })

    expect((await pfleger).isCorrectPassword((await pfleger).password)).toBeTruthy();
 })

 test("updateOne",async () => {
    const pfleger = new Pfleger({
        name: "Hamza",
        password: "1234"
    })
    await pfleger.save()
    let updated = await pfleger.updateOne({name: "Hamza"}, {password: "213"});
    let hashedCompare = bcrypt.compare("1234", pfleger.password);
    expect(hashedCompare).toBeFalsy;
 })

 test("updateOne",async () => {
    const pfleger = new Pfleger({
        name: "Hamza",
        password: "1234"
    })
    await pfleger.save()
    await pfleger.updateOne({name: "Hamza"}, {password: "3324"})
    const updated = await Pfleger.findOne({name: "Hamza"})
    expect(updated?.password).not.toBe("1234");

 })

 test("updateOne",async () => {
    const pfleger = new Pfleger({
        name: "Hamza",
        password: "1234"
    })
    await pfleger.save();
    await Pfleger.updateOne({name: "Hamza", password: "3321"});
    expect(await pfleger.isCorrectPassword(pfleger.password))
 })

 test("update",async () => {
    const pfleger = new Pfleger({
        name: "Hamza",
        password: "1234"
    })
    await pfleger.save();
    await Pfleger.updateOne({name: "Hamza"}, {password: "3321"});
    const updated = await Pfleger.findOne({name: "Hamza"});
    expect(updated?.password).not.toEqual("1234");
 })

 test("Hashs mit gleichen Passwörter ungleich",async () => {
    const pfleger = Pfleger.create({
        name: "Hamza",
        password: "1234"
    })
    const pfleger2 = Pfleger.create({
        name: "Ham",
        password: "1234"
    })
    expect((await pfleger).password).not.toBe("1234")
    expect((await pfleger2).password).not.toBe("1234")
    expect((await pfleger).password).not.toEqual((await pfleger2).password);
 })