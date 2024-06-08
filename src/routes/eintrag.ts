import express from "express";
import { createEintrag, deleteEintrag, getEintrag, updateEintrag } from "../services/EintragService";
import { body, matchedData, param, validationResult } from "express-validator";
import { EintragResource } from "../Resources";
import { requiresAuthentication, optionalAuthentication } from "./authentication";

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
            const create = await createEintrag(eintrag);
            res.status(201).send(create);
        } catch (err) {
            let errorClosed = []
            if(err instanceof Error){
                if(err.message === `Protokoll ${req.body.protokoll} is already closed`){
                    errorClosed.push(
                        {
                            type: "field", location: "body", msg: "Protokoll is closed!",
                            path: "closed", value: req.body.closed,
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
            res.send(getEint)
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
            const updated = await updateEintrag(resource)
            res.send(updated);
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
            const deleted = await deleteEintrag(id)
            res.status(204).send(deleted)
        } catch (err) {
            res.status(404)
            next(err)
        }
})