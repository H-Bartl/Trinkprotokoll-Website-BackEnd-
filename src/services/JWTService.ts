import { LoginResource } from "../Resources";
import { login } from "./AuthenticationService";
import { JsonWebTokenError, JwtPayload, sign, verify } from "jsonwebtoken";
import { Pfleger } from "../model/PflegerModel";

export async function verifyPasswordAndCreateJWT(name: string, password: string): Promise<string | undefined> {
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
        sub: einlogen.id,
        role: einlogen.role
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
        throw new JsonWebTokenError("JWT is unvalid")
    }

    try {
        verify(jwtString, secret)
    } catch (error) {
        throw new JsonWebTokenError("JWT is unvalid")
    }

    const payload = verify(jwtString, secret) as JwtPayload

    const subId = payload.sub!
    const pRole = payload.role
    const pExp = payload.exp!
    let loginResource: LoginResource = {
        id: subId,
        role: pRole,
        exp: pExp
    }
    return loginResource
    
}
