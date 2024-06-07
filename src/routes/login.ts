import express from "express";
import { body, matchedData, validationResult } from "express-validator";
import { login } from "../services/AuthenticationService";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../services/JWTService";
import { LoginResource } from "../Resources";


export const loginRouter = express.Router();

loginRouter.post("/",
    body("name").isString().isLength({min: 1, max: 100}),
    body("password").isStrongPassword().isString(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).send({errors: errors})
        }
        const ttl = parseInt(process.env.JWT_TTL!);
        try {
            const logreq = matchedData(req);
            const jwtString = await verifyPasswordAndCreateJWT(logreq.name, logreq.password)
            const loginRes = await verifyJWT(jwtString)

            res.cookie("access_token", jwtString, {
                httpOnly: true,
                expires: new Date(Date.now() + ttl * 1000),
                secure: true,
                sameSite: "none"
            })
            res.status(201).send(loginRes);
        } catch (err) {
            res.status(401)
            next(err)
        }
    })

    loginRouter.get("/",async (req, res, next) => {
        const jwtString = req.cookies.access_token
        try {
            const verifyJwt = verifyJWT(jwtString);
            res.status(200).send(verifyJwt);
        } catch (err) {
            res.send(false)
            res.clearCookie(jwtString)
            // next(err)
        }
    })

    loginRouter.delete("/",async (req, res, next) => {
        const jwtString = req.cookies.access_token;
        res.clearCookie(jwtString);
        res.sendStatus(204)
    })