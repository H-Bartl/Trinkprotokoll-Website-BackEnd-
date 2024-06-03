import { Pfleger } from "../model/PflegerModel";

/**
 * Prüft Name und Passwort, bei Erfolg ist `success` true 
 * und es wird die `id` und `role` ("u" oder "a") des Pflegers zurückgegeben
 * 
 * Falls kein Pfleger mit gegebener Name existiert oder das Passwort falsch ist, wird nur 
 * `false` zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(name: string, password: string): Promise<{ id: string, role: "a" | "u" } | false> {
    if(!name) return false;
    if(!password) return false;

    let findPfleger = await Pfleger.findOne({name}).exec();
    if(!findPfleger) return false;

    if(!await findPfleger.isCorrectPassword(password)) return false
    
    if(findPfleger.admin === true){
        return {
            id: findPfleger.id,
            role: "a"
        }
    }else {
        return {
            id: findPfleger.id,
            role: "u"
        }
    }

    
}