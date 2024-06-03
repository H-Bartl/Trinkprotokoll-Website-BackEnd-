import { Schema, model, Types} from "mongoose";

export interface IProtokoll {
    patient: string
    ersteller: Types.ObjectId
    datum: Date
    public?: boolean
    closed?: boolean
    updatedAt: Date
}

const ProtokollSchema = new Schema<IProtokoll> ({
    patient: {type: String, required: true},
    datum: {type: Date, required: true},
    ersteller: {type: Schema.Types.ObjectId, ref: "Pfleger",required: true},
    public: {type: Boolean, default: false},
    closed: {type: Boolean, default: false},
    updatedAt: {type: Date}
}, {timestamps: true}
);
    

export const Protokoll = model("Protokoll", ProtokollSchema);