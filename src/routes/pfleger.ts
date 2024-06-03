import express from "express";
import { createPfleger, deletePfleger, getAllePfleger, updatePfleger } from "../services/PflegerService";
import { PflegerResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";


export const pflegerRouter = express.Router();

pflegerRouter.get("/alle",async (req, res, next) => {
    const pfleger = await getAllePfleger();
    res.send(pfleger); // 200 default
    
})

pflegerRouter.post("/",
    body("name").isString().isLength({min: 3, max: 100}),
    body("password").isString().isStrongPassword(),
    body("admin").isBoolean(),
    async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({errors: errors.array()})
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
    body("password").isString().isStrongPassword(),
    body("admin").isBoolean(),
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
    async (req,res,next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).send({errors: errors.array()})
        }
        try {
            const pflegerId = matchedData(req)
            const deleted = await deletePfleger(pflegerId.id)
            res.status(204).send(deleted);
        } catch (err) {
            res.status(404)
            next(err)
        }
})