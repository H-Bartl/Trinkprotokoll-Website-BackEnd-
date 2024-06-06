import dotenv from "dotenv";
dotenv.config();

import { JwtPayload, sign, verify } from "jsonwebtoken";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/services/JWTService";
import { createPfleger } from "../../src/services/PflegerService";
import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { LoginResource } from "../../src/Resources";

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

test("JWTService Test throw login fehler",async () => {
    await expect(verifyPasswordAndCreateJWT("Hamza", "falsch")).rejects.toThrow("Login fehlgeschlagen!")
})

test("JWTService Test verifyJWT", () => {
    const response = verifyJWT(jwtString);
    const payload = verify(jwtString, process.env.JWT_SECRET!) as LoginResource
    let loginResource: LoginResource = {
        id: pfleger.id,
        role: 'a',
        exp: payload.exp
    }
    expect(response).toStrictEqual(loginResource)
})

test("JWTService Test mit secret löschen",async () => {
    const deletedSecret = delete process.env.JWT_SECRET
    try{
        await expect(verifyPasswordAndCreateJWT("Hamza", "Password42!")).rejects.toThrow("Umgebungsvariable Secret und TTL nicht gegeben!")
    } finally {
        process.env.JWT_SECRET = "HamZA.Secret42!"
    }
})

test("Negativ tests", () => {
    expect(() => verifyJWT("")).toThrow("JWT is unvalid")
})

test("verifyJWT testen ohne env",async () => {
    const deletedSecret = delete process.env.JWT_SECRET
    try{
        expect(() => verifyJWT(jwtString)).toThrow("Umgebungsvariable Secret und TTL nicht gegeben!")
    } finally {
        process.env.JWT_SECRET = "HamZA.Secret42!"
    }
})

test("verifyJWT testen ohne env",async () => {
    const secret = "ldse"
    const ttl = process.env.JWT_TTL;

    const payload: JwtPayload = {
        sub: pfleger.id,
        role: "a"
    }

    let jwtString3 = sign(
        payload,
        secret!,
        {
            expiresIn: ttl,
            algorithm: "HS256"
        }
    )
    expect(() => verifyJWT(jwtString3)).toThrow("JWT is unvalid")
    
})
