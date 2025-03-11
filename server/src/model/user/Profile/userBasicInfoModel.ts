import mongoose from 'mongoose'
import { IUserBasicInfo } from '../../../types/userTypes'
import { ELanguageExperties, ESocialPlatform } from '../../../constants/applicationEnums'

const userBasicInfoSchema = new mongoose.Schema<IUserBasicInfo>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        phone: {
            type: String,
            required: false
        },
        dateOfBirth: {
            type: Date,
            required: false
        },
        gender: {
            type: String,
            required: false
        },
        region: {
            type: String,
            required: false
        },
        languages: [
            {
                _id: false,
                name: {
                    type: String,
                    required: true
                },
                read: {
                    type: String,
                    enum: Object.values(ELanguageExperties),
                    required: true
                },
                write: {
                    type: String,
                    enum: Object.values(ELanguageExperties),
                    required: true
                }
            }
        ],
        skills: [
            {
                type: String,
                required: true
            }
        ],
        socialLinks: [
            {
                _id: false,
                platform: {
                    type: String,
                    enum: Object.values(ESocialPlatform),
                    required: true
                },
                url: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    { timestamps: true }
)

export default mongoose.model<IUserBasicInfo>('userBasicInfo', userBasicInfoSchema)
