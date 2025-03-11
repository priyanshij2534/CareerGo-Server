import mongoose from 'mongoose'
import { IUserCertification } from '../../../types/userTypes'

const userCertificationSchema = new mongoose.Schema<IUserCertification>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        title: {
            type: String,
            required: true
        },
        issuedBy: {
            type: String,
            required: true
        },
        startDate: {
            type: String,
            required: true
        },
        endDate: {
            type: String,
            default: null
        },
        expiryDate: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
)

export default mongoose.model<IUserCertification>('userCertification', userCertificationSchema)
