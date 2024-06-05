import { LoginResource } from "../Resources";
import { login } from "./AuthenticationService";
import { JwtPayload, sign } from "jsonwebtoken";
import { Pfleger } from "../model/PflegerModel";

export async function verifyPasswordAndCreateJWT(name: string, password: string): Promise<string | undefined> {
    let findPfleger = await Pfleger.findOne({name}).exec();
    if(!findPfleger){
        throw new Error("Kein regristierter Pfleger auf diesem Namen!")
    }

    const einlogen = await login(name, password);
    if(!einlogen){
        throw new Error("Login fehlgeschlagen!")
    }

    const secret = process.env.JWT_SECRET;
    const ttl = process.env.JWT_TTL;

    if(!secret || !ttl){
        throw new Error("Umgebungsvariable Secret und TTL nicht gegeben!")
    }

    const payload: JwtPayload = {
        sub: findPfleger.id,
        role: einlogen.role,
        exp: Number(ttl)
    }

    const jwtString = sign(
        payload,
        secret,
        {
            expiresIn: ttl,
            algorithm: "HS256"
        }
    )

    return jwtString;
}

export function verifyJWT(jwtString: string | undefined): LoginResource {
    const secret = process.env.JWT_SECRET;
    const ttl = process.env.JWT_TTL;

    if(!secret || !ttl){
        throw new Error("Umgebungsvariable Secret und TTL nicht gegeben!")
    }

    if(!jwtString){
        throw new Error("Falsch")
    }

    if(!jwtString!.includes(secret)){
        throw new Error("Falsch")
    }

    throw new Error("Function verifyJWT not implemented yet")
}
