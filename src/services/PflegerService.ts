import { Types } from "mongoose";
import { PflegerResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";


/**
 * Die Passwörter dürfen nicht zurückgegeben werden.
 */
export async function getAllePfleger(): Promise<PflegerResource[]> {
    const findPfleger = await Pfleger.find().exec();
    return findPfleger.map(pfleger => {
        return {
            id: pfleger.id.toString(),
            name: pfleger.name,
            admin: pfleger.admin!
        }
    })
}

/**
 * Erzeugt einen Pfleger. Das Password darf nicht zurückgegeben werden.
 */
export async function createPfleger(pflegerResource: PflegerResource): Promise<PflegerResource> {
    const erstellen = await Pfleger.create({
        id: pflegerResource.id,
        name: pflegerResource.name,
        admin: pflegerResource.admin,
        password: pflegerResource.password
    })
    return {
        id: erstellen.id,
        name: erstellen.name,
        admin: erstellen.admin!
    }
}


/**
 * Updated einen Pfleger.
 */
export async function updatePfleger(pflegerResource: PflegerResource): Promise<PflegerResource> {
    // if(!pflegerResource.id){
    //     throw new Error("Keine Id oder falsche Id!")
    // }
    const find = await Pfleger.findById(pflegerResource.id).exec()
    if(!find || !pflegerResource.id){
        throw new Error("Pfleger id nicht gefunden!")
    }
    find._id = new Types.ObjectId(pflegerResource.id)
    find.name = pflegerResource.name
    find.admin = pflegerResource.admin
    if(pflegerResource.password) find.password = pflegerResource.password
    await find.save()
    return {
        id: find.id,
        name: find.name,
        admin: find.admin!
    }
}

/**
 * Beim Löschen wird der Pfleger über die ID identifiziert.
 * Falls Pfleger nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der Pfleger gelöscht wird, müssen auch alle zugehörigen Protokolls und Eintrags gelöscht werden.
 */
export async function deletePfleger(id: string): Promise<void> {
    if(!id){
        throw new Error("Id ist falsch eingegeben!");
    }
    const res = await Pfleger.findById(id).exec();
    if(!res){
        throw new Error("Id existiert nicht!")
    }

    await Pfleger.deleteOne({_id: new Types.ObjectId(id)}).exec();

    await Protokoll.deleteMany({ersteller: new Types.ObjectId(id)}).exec();

    await Eintrag.deleteMany({ersteller: new Types.ObjectId(id)}).exec();
}