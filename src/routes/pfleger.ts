import express from "express";
import { createPfleger, deletePfleger, getAllePfleger, updatePfleger } from "../services/PflegerService";
import { PflegerResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";
import { Pfleger } from "../model/PflegerModel";


export const pflegerRouter = express.Router();

pflegerRouter.get("/alle", optionalAuthentication ,async (req, res, next) => {
    if(req.role === 'u'){
        res.sendStatus(403)
    }
    const pfleger = await getAllePfleger();
    res.send(pfleger); // 200 default
    
})

pflegerRouter.post("/",
    body("name").isString().isLength({min: 3, max: 100}),
    body("password").isString().isStrongPassword(),
    body("admin").isBoolean(),
    requiresAuthentication,
    async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({errors: errors.array()})
    }

    if(req.role === 'u') {
        res.sendStatus(403)
    }
    try {
        const pfleger = matchedData(req) as PflegerResource;
        const create = await createPfleger(pfleger)
        res.status(201).send(create); //201 weil created
    } catch (err) {
        res.status(404);
        next(err)
    }
})

pflegerRouter.put("/:id",
    param("id").isMongoId(),
    body("id").isMongoId(),
    body("name").isString().isLength({min: 3, max: 100}),
    body("password").optional().isString().isStrongPassword(),
    body("admin").isBoolean(),
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
        if (errors.length>0) {
            return res.status(400).send({ errors: errors });
        }

        if(req.role === 'u') {
            res.sendStatus(403)
        }
        try {
            const pflegerResource = matchedData(req) as PflegerResource;
            const updated = await updatePfleger(pflegerResource)
            res.send(updated);
        } catch (err) {
            res.status(404);
            next(err)
        }
})

pflegerRouter.delete("/:id",
    param("id").isMongoId(),
    requiresAuthentication,
    async (req,res,next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).send({errors: errors.array()})
        }

        if(req.role === 'u') {
            res.sendStatus(403)
        }
        const pflegerId = matchedData(req)

        if(req.pflegerId === pflegerId.id){
            res.sendStatus(403)
        }          
        try {
            
            const deleted = await deletePfleger(pflegerId.id)
            res.status(204).send(deleted);
            
        } catch (err) {
            res.status(404)
            next(err)
        }
})