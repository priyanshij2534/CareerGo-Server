import mongoose from 'mongoose'
import { ICounselling } from '../../types/counsellingTypes'
import { ECounsellingStatus } from '../../constants/applicationEnums'

const counsellingSchema = new mongoose.Schema<ICounselling>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'institution',
            required: true
        },
        status: {
            type: String,
            enum: ECounsellingStatus,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        purpose: {
            type: String,
            required: true
        },
        isApproved: {
            type: Boolean,
            required: false
        },
        diApprovalReason: {
            type: String,
            required: false
        },
        meetingURL: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
)

export default mongoose.model<ICounselling>('counselling', counsellingSchema)
