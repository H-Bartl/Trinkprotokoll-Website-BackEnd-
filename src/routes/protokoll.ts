import express from "express";
import { getAlleEintraege } from "../services/EintragService";
import { createProtokoll, deleteProtokoll, getAlleProtokolle, getProtokoll, updateProtokoll } from "../services/ProtokollService";
import { body, matchedData, param, validationResult } from "express-validator";
import { ProtokollResource } from "../Resources";
import { requiresAuthentication, optionalAuthentication } from "./authentication";


export const protokollRouter = express.Router();

protokollRouter.get("/:id/eintraege", 
    param("id").isMongoId(),
    optionalAuthentication,
    async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).send({errors: errors.array()})
        }
        const id = req.params!.id!;
        try {
            const eintraege = await getAlleEintraege(id);
            res.send(eintraege); // 200 by default
        } catch (err) {
            res.status(404); // not found
            next(err);
        }
})

protokollRouter.get("/alle", optionalAuthentication, async (req,res,next) => {
        const protId = req.body.ersteller
        const protokolle = await getAlleProtokolle(protId)
        res.send(protokolle)
})

protokollRouter.post("/",
    body("patient").isString().isLength({min: 1, max: 100}),
    body("datum").isString().isLength({min: 1, max: 100}),
    body("public").optional().isBoolean(),
    body("closed").optional().isBoolean(),
    body("ersteller").isMongoId(),
    body("erstellerName").optional().isString().isLength({min: 1, max: 100}),
    body("updatedAt").optional().isString().isLength({min: 1, max: 100}),
    body("gesamtMenge").optional().isNumeric(),
    requiresAuthentication,
    async (req,res,next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).send({errors: errors.array()})
        }
        try {
            const resource = matchedData(req) as ProtokollResource;
            const create = await createProtokoll(resource)
            res.status(201).send(create)
        } catch (err) {
            const errConstraints = []
            if(err instanceof Error)
                if(err.message === "Es gibt bereits ein Protokoll mit diesem Patienten mit diesem Datum!"){
                    errConstraints.push(
                        {
                            type: "field", location: "body", msg: "Constraints date patient",
                            path: "patient", value: req.body.patient,
                        },
                        {
                            type: "field", location: "body", msg: "Constraints date patient",
                            path: "datum", value: req.body.datum,
                        }
                    )
                }
                if(errConstraints.length > 0){
                    return res.status(400).send({errors: errConstraints})
                }
            res.status(404);
            next(err)
        }
})

protokollRouter.get("/:id",
    param("id").isMongoId(),
    optionalAuthentication,
    async (req,res,next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).send({errors: errors.array()})
        }
        try {

            const id = matchedData(req)
            const getProt = await getProtokoll(id.id)

            if(getProt.public === true) res.send(getProt)
            if(getProt.public === false && req.pflegerId !== getProt.ersteller) res.status(403)

            res.send(getProt)
        } catch (err) {
            res.status(404);
            next(err)
        }
})

protokollRouter.put("/:id",
    param("id").isMongoId(),
    body("id").isMongoId(),
    body("patient").isString().isLength({min: 1, max: 100}),
    body("datum").isString().isLength({min: 1, max: 100}),
    body("public").optional().isBoolean(),
    body("closed").optional().isBoolean(),
    body("ersteller").isMongoId(),
    body("erstellerName").optional().isString().isLength({min: 1, max: 100}),
    body("updatedAt").optional().isString().isLength({min: 1, max: 100}),
    body("gesamtMenge").optional().isNumeric(),
    requiresAuthentication,
    async (req,res,next) => {
        const errors = validationResult(req).array()
        if(req.params!.id !== req.body.id){
            errors.push(
                {
                    type: "field", location: "params", msg: "IDs do not match",
                    path: "id", value: req.params!.id,
                },
                {
                    type: "field", location: "body", msg: "IDs do not match",
                    path: "id", value: req.body.id,
                }
            )
        }

        if(errors.length > 0){
            return res.status(400).send({errors: errors})
        }
        try {
            const resource = matchedData(req) as ProtokollResource
            const prot = await getProtokoll(req.params.id)

            if(req.pflegerId !== prot.ersteller) res.status(403)

            const updated = await updateProtokoll(resource)
            res.send(updated)
        } catch (err) {
            const errConstraints = []
            if(err instanceof Error)
                if(err.message == "Es gibt bereits ein Protokoll mit diesem Patienten mit diesem Datum!"){
                    errConstraints.push(
                        {
                            type: "field", location: "body", msg: "Constraints date patient",
                            path: "patient", value: req.body.patient,
                        },
                        {
                            type: "field", location: "body", msg: "Constraints date patient",
                            path: "datum", value: req.body.datum,
                        }
                    )
                }
                if(errConstraints.length > 0){
                    return res.status(400).send({errors: errConstraints})
                }
            res.status(404)
            next(err)
        }
})

protokollRouter.delete("/:id",
    param("id").isMongoId(),
    requiresAuthentication,
    async (req,res,next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).send({errors: errors.array()})
        }
        try {
            const id = req.params!.id;
            const prot = await getProtokoll(id)
            const deleted = await deleteProtokoll(id)

            if(req.pflegerId !== prot.ersteller) res.status(403)

            res.status(204).send(deleted)
        } catch (err) {
            res.status(404);
            next(err)
        }
})