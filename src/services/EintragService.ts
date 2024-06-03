import { Types } from "mongoose";
import { EintragResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString } from "./ServiceHelper";

/**
 * Gibt alle Eintraege in einem Protokoll zurück.
 * Wenn das Protokoll nicht gefunden wurde, wird ein Fehler geworfen.
 */
export async function getAlleEintraege(protokollId: string): Promise<EintragResource[]> {
    if(!protokollId) throw new Error("Id wurde nicht angegeben!")
    const findProt = await Protokoll.findById(protokollId).exec()
        if(!findProt) {
            throw new Error("Protokoll mit dieser Id wurde nicht gefunden!")
        }
        
    const findEintrag = await Eintrag.find({protokoll: protokollId}).exec()
    
    const findPfleger = await Pfleger.findById(findProt.ersteller).exec()
    if(!findPfleger) {
        throw new Error("Pfleger mit dieser Id wurde nicht gefunden!")
    }

    return findEintrag.map(e => {
        return{
            id: e.id,
            getraenk: e.getraenk,
            menge: e.menge,
            kommentar: e.kommentar,
            ersteller: e.ersteller.toString(),
            erstellerName: findPfleger.name,
            createdAt: dateToString(e.createdAt!),
            protokoll: e.protokoll.toString()
        } as EintragResource
    })
}


/**
 * Liefert die EintragResource mit angegebener ID.
 * Falls kein Eintrag gefunden wurde, wird ein Fehler geworfen.
 */
export async function getEintrag(id: string): Promise<EintragResource> {
    const find = await Eintrag.findById(id).exec()
    if(!find) throw new Error("Id wurde nicht gefunden!");

    const getProt = await Protokoll.findById(find.protokoll).exec()
    if(!getProt){
        throw new Error("Protokoll nicht gefunden")
    }

    const getPfleger = await Pfleger.findById(find.ersteller).exec()
    if(!getPfleger){
        throw new Error("Pfleger nicht gefunden");
    }

    return {
        id: find.id,
        getraenk: find.getraenk,
        menge: find.menge,
        kommentar: find.kommentar,
        ersteller: find.ersteller.toString(),
        erstellerName: getPfleger.name,
        createdAt: dateToString(find.createdAt!),
        protokoll: find.protokoll.toString()
    }
}

/**
 * Erzeugt eine Eintrag.
 * Daten, die berechnet werden aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (done) ist, wird ein Fehler wird geworfen.
 */
export async function createEintrag(eintragResource: EintragResource): Promise<EintragResource> {
    const pfleger = await Pfleger.findById(eintragResource.ersteller).exec();
    if (!pfleger) {
        throw new Error(`No pfleger found with id ${eintragResource.ersteller}`);
    }
    const protokoll = await Protokoll.findById(eintragResource.protokoll).exec();
    if (!protokoll) {
        throw new Error(`No protokoll found with id ${eintragResource.protokoll}`);
    }
    if (protokoll.closed) {
        throw new Error(`Protokoll ${protokoll.id} is already closed`);
    }

    const eintrag = await Eintrag.create({
        getraenk: eintragResource.getraenk,
        menge: eintragResource.menge,
        kommentar: eintragResource.kommentar,
        ersteller: eintragResource.ersteller,
        protokoll: eintragResource.protokoll
    })
    return {
        id: eintrag.id,
        getraenk: eintrag.getraenk,
        menge: eintrag.menge,
        kommentar: eintrag.kommentar,
        ersteller: pfleger.id,
        erstellerName: pfleger.name,
        createdAt: dateToString(eintrag.createdAt!),
        protokoll: protokoll.id
    }
}


/**
 * Updated eine Eintrag. Es können nur Name, Quantity und Remarks geändert werden.
 * Aktuell können Eintrags nicht von einem Protokoll in einen anderen verschoben werden.
 * Auch kann der Creator nicht geändert werden.
 * Falls die Protokoll oder Creator geändert wurde, wird dies ignoriert.
 */
export async function updateEintrag(eintragResource: EintragResource): Promise<EintragResource> {
    const find = await Eintrag.findById(eintragResource.id).exec()
    if(!find) throw new Error("Eintrag mit dieser Id wurde nicht gefunden!");
    
    const getProt = await Protokoll.findById(eintragResource.protokoll).exec()
    if(!getProt){
        throw new Error("Protokoll nicht gefunden")
    }

    const getPfleger = await Pfleger.findById(eintragResource.ersteller).exec()
    if(!getPfleger){
        throw new Error("Pfleger nicht gefunden");
    }

    find.getraenk = eintragResource.getraenk
    find.menge = eintragResource.menge
    find.kommentar = eintragResource.kommentar!
    await find.save()
    return{
        id: find.id,
        getraenk: find.getraenk,
        menge: find.menge,
        kommentar: find.kommentar,
        ersteller: find.ersteller.toString(),
        erstellerName: getPfleger.name,
        createdAt: dateToString(find.createdAt!),
        protokoll: find.protokoll.toString()
    }
}


/**
 * Beim Löschen wird das Eintrag über die ID identifiziert. 
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteEintrag(id: string): Promise<void> {
    if(!id) throw new Error("Id gibt es nicht oder ist falsch!");
    const find = await Eintrag.findById(id).exec()
    if(!find) throw new Error("Id wurde nicht gefunden!");
    await Eintrag.deleteOne({_id: new Types.ObjectId(id)}).exec();
}

