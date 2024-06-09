import express from "express";
import { createEintrag, deleteEintrag, getEintrag, updateEintrag } from "../services/EintragService";
import { body, matchedData, param, validationResult } from "express-validator";
import { EintragResource } from "../Resources";
import { requiresAuthentication, optionalAuthentication } from "./authentication";
import { getProtokoll } from "../services/ProtokollService";

export const eintragRouter = express.Router();

eintragRouter.post("/",
    body("getraenk").isString().isLength({min: 1, max: 100}),
    body("menge").isNumeric(),
    body("ersteller").isMongoId(),
    body("protokoll").isMongoId(),
    body("kommentar").optional().isString().isLength({min: 1, max: 1000}),
    body("erstellerName").optional().isString().isLength({min: 1, max: 100}),
    body("createdAt").optional().isString().isLength({min: 1, max: 100}),
    requiresAuthentication,
    async (req,res,next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).send({errors: errors.array()})
        }
        try {
            const eintrag = matchedData(req) as EintragResource;
            const prot = await getProtokoll(eintrag.protokoll)
            const create = await createEintrag(eintrag);

            if(prot.public || (prot.public=== false && req.pflegerId === prot.ersteller)){
                res.status(201).send(create)
            }else {
                res.sendStatus(403)
            }
        } catch (err) {
            let errorClosed = []
            if(err instanceof Error){
                if(err.message === `Protokoll ${req.body.protokoll} is already closed`){
                    errorClosed.push(
                        {
                            type: "field", location: "body", msg: "Protokoll is closed!",
                            path: "closed", value: req.body.protokoll,
                        }
                    )
                }
            }
            if(errorClosed.length > 0){
                res.status(400).send({errors: errorClosed})
            }
            res.status(404);
            next(err);
        }
})

eintragRouter.get("/:id",
    param("id").isMongoId(),
    optionalAuthentication,
    async (req,res,next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).send({errors: errors.array()})
        }
        try {
            const id = matchedData(req)
            const getEint = await getEintrag(id.id);

            const prot = await getProtokoll(getEint.protokoll)
            if(prot.public || (prot.public === false && req.pflegerId === getEint.ersteller || req.pflegerId === prot.ersteller)){
                res.send(getEint)
            }else{
                res.sendStatus(403)
            }
        } catch (err) {
            res.status(404);
            next(err)
        }
})

eintragRouter.put("/:id",
    param("id").isMongoId(),
    body("id").isMongoId(),
    body("getraenk").isString().isLength({min: 1, max: 100}),
    body("menge").isNumeric(),
    body("kommentar").optional().isString().isLength({min: 1, max: 1000}),
    body("ersteller").isMongoId(),
    body("erstellerName").optional().isString().isLength({min: 1, max: 100}),
    body("createdAt").optional().isString().isLength({min: 1, max: 100}),
    body("protokoll").isMongoId(),
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
            const resource = matchedData(req) as EintragResource

            const prot = await getProtokoll(resource.protokoll)

            if(req.pflegerId === prot.ersteller || req.pflegerId === resource.ersteller){
                const updated = await updateEintrag(resource)
                res.send(updated)
            }else{
                res.sendStatus(403)
            }
        } catch (err) {
            res.status(404);
            next(err)
        }
})

eintragRouter.delete("/:id",
    param("id").isMongoId(),
    requiresAuthentication,
    async (req,res,next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).send({errors: errors.array()})
        }
        try {
            const id = req.params!.id
            const eintrag = await getEintrag(id)
            const prot = await getProtokoll(eintrag.protokoll)
            if(req.pflegerId === prot.ersteller || req.pflegerId === eintrag.ersteller){
                const deleted = await deleteEintrag(id)
                res.status(204).send(deleted)
            }else {
                res.sendStatus(403)
            }
        } catch (err) {
            res.status(404)
            next(err)
        }
})