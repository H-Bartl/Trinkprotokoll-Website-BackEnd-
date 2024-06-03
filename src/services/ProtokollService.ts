import { Types } from "mongoose";
import { ProtokollResource } from "../Resources";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString, stringToDate } from "./ServiceHelper";
import { Eintrag } from "../model/EintragModel";

/**
 * Gibt alle Protokolls zurück, die für einen Pfleger sichtbar sind. Dies sind:
 * - alle öffentlichen (public) Protokolls
 * - alle eigenen Protokolls, dies ist natürlich nur möglich, wenn die pflegerId angegeben ist.
 */
export async function getAlleProtokolle(pflegerId?: string): Promise<ProtokollResource[]> {
    const x = await Protokoll.find({
        $or: [
            {
                ersteller: new Types.ObjectId(pflegerId)
            },
            {
                public: true
            }
        ]
    })
    // Promise.all hinzugefügt um Eintrag mit async benutzen zu können
    return await Promise.all(x.map(async p => {
        const eintrag = await Eintrag.find({protokoll: p.id}).exec()
        let gesamtMenge = 0;
        for (let index = 0; index < eintrag.length; index++) {
            gesamtMenge = gesamtMenge + eintrag[index].menge;
        }
        const pfleger = await Pfleger.findById(p.ersteller).exec();
        return {
            id: p.id,
            patient: p.patient,
            datum: dateToString(p.datum),
            public: p.public,
            closed: p.closed,
            ersteller: p.ersteller.toString(),
            erstellerName: pfleger!.name,
            updatedAt: dateToString(p.updatedAt!),
            gesamtMenge: gesamtMenge
        } as ProtokollResource
    }))
}

/**
 * Liefer die Protokoll mit angegebener ID.
* Falls keine Protokoll gefunden wurde, wird ein Fehler geworfen.
*/
export async function getProtokoll(id: string): Promise<ProtokollResource> {
    const findProtokoll = await Protokoll.findById(id).exec();
    if(!findProtokoll) {
        throw new Error("Ein Protokoll mit dieser id wurde nicht gefunden!")
    }
    const pfleger = await Pfleger.findById(findProtokoll.ersteller).exec()
    if(!pfleger){
        throw new Error("Pfleger wurde nicht gefunden")
    }
    const eintrag = await Eintrag.find({protokoll: id}).exec()
    //lokale Variable zum berechnen der Gesamtmenge
    let gesamtMenge = 0;
    //schleife um die Eintraege zu durchlaufen und addieren der Menge
    for (let index = 0; index < eintrag.length; index++) {
        gesamtMenge = gesamtMenge + eintrag[index].menge;
    }

    let protResource = {
        id: findProtokoll.id,
        patient: findProtokoll.patient,
        datum: dateToString(findProtokoll.datum),
        public: findProtokoll.public,
        closed: findProtokoll.closed,
        ersteller: findProtokoll.ersteller.toString(),
        erstellerName: pfleger.name,
        updatedAt: dateToString(findProtokoll.updatedAt!),
        gesamtMenge: gesamtMenge
    }

    return protResource
}

/**
 * Erzeugt das Protokoll.
 */
export async function createProtokoll(protokollResource: ProtokollResource): Promise<ProtokollResource> {
    const findPatient = await Protokoll.findOne({patient: protokollResource.patient, datum: stringToDate(protokollResource.datum)}).exec()
    if(findPatient){
        throw new Error("Es gibt bereits ein Protokoll mit diesem Patienten mit diesem Datum!")
        
    }
    const findPfleger = await Pfleger.findById(protokollResource.ersteller).exec()
    if(!findPfleger){
        throw new Error("Pfleger wurde nicht gefunden!")
    }
    const erstellen = await Protokoll.create({
        patient: protokollResource.patient,
        datum: stringToDate(protokollResource.datum),
        public: protokollResource.public,
        closed: protokollResource.closed,
        ersteller: findPfleger.id,
    })
    return {
        id: erstellen.id,
        patient: erstellen.patient,
        datum: dateToString(erstellen.datum),
        public: erstellen.public,
        closed: erstellen.closed,
        ersteller: erstellen.ersteller.toString(),
        erstellerName: findPfleger.name,
        updatedAt: dateToString(erstellen.updatedAt!),
        gesamtMenge: 0
    }
}

/**
 * Ändert die Daten einer Protokoll.
 */
export async function updateProtokoll(protokollResource: ProtokollResource): Promise<ProtokollResource> {
    const findPatient = await Protokoll.findOne({patient: protokollResource.patient, datum: stringToDate(protokollResource.datum)}).exec()
    if(findPatient){
        throw new Error("Es gibt bereits ein Protokoll mit diesem Patienten mit diesem Datum!")
    }
    const findProt = await Protokoll.findById(protokollResource.id).exec()

    const date = stringToDate(protokollResource.datum);

    if(!findProt) throw new Error("Es gibt kein Protokoll die zu dieser id passt")

    const findPfleger = await Pfleger.findById(findProt.ersteller).exec()
    if(!findPfleger){
        throw new Error("Pfleger wurde nicht gefunden")
    }

    findProt.patient = protokollResource.patient
    findProt.datum = date
    findProt.public = protokollResource.public
    findProt.closed = protokollResource.closed
    await findProt.save()    

    return{
        id: findProt.id,
        patient: findProt.patient,
        datum: dateToString(findProt.datum),
        public: findProt.public,
        closed: findProt.closed,
        ersteller: findProt.ersteller.toString(),
        erstellerName: findPfleger.name,
        updatedAt: dateToString(findProt.updatedAt),
        gesamtMenge: protokollResource.gesamtMenge
    }
}

/**
 * Beim Löschen wird die Protokoll über die ID identifiziert.
 * Falls keine Protokoll nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn die Protokoll gelöscht wird, müssen auch alle zugehörigen Eintrags gelöscht werden.
 */
export async function deleteProtokoll(id: string): Promise<void> {
    const findProtokoll = await Protokoll.findById(id);
    if(!findProtokoll) throw new Error("Id wurde nicht gefunden!")
    await Protokoll.deleteOne({_id: new Types.ObjectId(id)}).exec();

    await Eintrag.deleteMany({protokoll: new Types.ObjectId(id)}).exec();
}    
