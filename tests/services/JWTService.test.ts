import dotenv from "dotenv";
dotenv.config();

import { JwtPayload, sign } from "jsonwebtoken";
import { verifyPasswordAndCreateJWT } from "../../src/services/JWTService";
import { createPfleger } from "../../src/services/PflegerService";
import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";

let pfleger: HydratedDocument<IPfleger>;
let jwtString: string;
let pfleger2: HydratedDocument<IPfleger>;
let jwtString2: string;

beforeEach(async () => {
    pfleger = await Pfleger.create({name: "Hamza", password: "Password42!", admin: true});
    pfleger2 = await Pfleger.create({name: "Toyota", password: "Supramk4!", admin: false});

    const secret = process.env.JWT_SECRET;
    const ttl = process.env.JWT_TTL;

    const payload: JwtPayload = {
        sub: pfleger.id,
        role: "a"
    }

    jwtString = sign(
        payload,
        secret!,
        {
            expiresIn: ttl,
            algorithm: "HS256"
        }
    )

    const payload2: JwtPayload = {
        sub: pfleger2.id,
        role: "u"
    }

    jwtString2 = sign(
        payload2,
        secret!,
        {
            expiresIn: ttl,
            algorithm: "HS256"
        }
    )
})

test("JWTService Test mit admin",async () => {
    const response = await verifyPasswordAndCreateJWT("Hamza", "Password42!");
    expect(response).toBe(jwtString)
})

test("JWTService Test mit user",async () => {
    const response = await verifyPasswordAndCreateJWT("Toyota", "Supramk4!");
    expect(response).toBe(jwtString2)
})

test("JWTService Test throw pfleger nicht gefunden",async () => {
    await expect(verifyPasswordAndCreateJWT("", "sdas")).rejects.toThrow("Kein regristierter Pfleger auf diesem Namen!")
})

test("JWTService Test throw login fehler",async () => {
    await expect(verifyPasswordAndCreateJWT("Hamza", "falsch")).rejects.toThrow("Login fehlgeschlagen!")
})