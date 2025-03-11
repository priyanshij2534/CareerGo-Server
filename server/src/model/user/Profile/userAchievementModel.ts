import mongoose from 'mongoose'
import { IUserAchievement } from '../../../types/userTypes'
import { EAchievementType } from '../../../constants/applicationEnums'

const userAchievementSchema = new mongoose.Schema<IUserAchievement>(
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
        type: {
            type: String,
            enum: Object.values(EAchievementType),
            required: true
        },
        awardedBy: {
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
        description: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
)

export default mongoose.model<IUserAchievement>('userAchievement', userAchievementSchema)
