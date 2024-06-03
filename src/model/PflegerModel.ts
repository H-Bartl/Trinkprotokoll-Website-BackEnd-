import { Schema, model, Types, Model} from "mongoose";
import bcrypt from "bcryptjs";
import { type } from "os";

export interface IPfleger {
    name: string
    password: string
    admin?: boolean
}

export interface IPflegerMethods {
    isCorrectPassword(candidatePassword: string): Promise<boolean>
}

type PflegerModel = Model<IPfleger, {}, IPflegerMethods>

const pflegerSchema = new Schema<IPfleger, PflegerModel, IPflegerMethods> ({
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    admin: {type: Boolean, default: false}
});

pflegerSchema.pre("save", async function () {
    if(this.isModified("password")){
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
})

pflegerSchema.pre("updateOne",async function () {
    let updatePw = this.getUpdate();
    if(updatePw != null && "password" in updatePw){
        const hashedPassword = await bcrypt.hash(updatePw.password, 10)
        updatePw.password = hashedPassword;
    }
})

pflegerSchema.method("isCorrectPassword",
    async function (candidatePassword:string): Promise<boolean> {
        if(this.password.startsWith("$2")){
            let hashedCompare = await bcrypt.compare(candidatePassword, this.password);
            return hashedCompare;
        }else {
            throw new Error("Passwort wurde nicht gehasht!")
        }
    })
export const Pfleger = model("Pfleger", pflegerSchema);