import mongoose from 'mongoose'
import { IInstitution } from '../../types/userTypes'

const institutionSchema = new mongoose.Schema<IInstitution>(
    {
        institutionName: {
            type: String,
            minlength: 2,
            maxlength: 72,
            required: true
        },
        emailAddress: {
            type: String,
            unique: true,
            required: true
        },
        logo: {
            type: String,
            required: false
        },
        website: {
            type: String,
            required: false
        },
        registrationNumber: {
            type: String,
            required: true
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        consent: {
            type: Boolean,
            required: true
        },
        admission: {
            type: Boolean,
            required: false
        }
    },
    { timestamps: true }
)

export default mongoose.model<IInstitution>('institution', institutionSchema)
