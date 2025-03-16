import mongoose from 'mongoose'
import { IUserEducation } from '../../../types/userTypes'
import { EEducationCategory, EGradeType } from '../../../constants/applicationEnums'

const userEducationSchema = new mongoose.Schema<IUserEducation>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        institutionName: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: Object.values(EEducationCategory),
            required: true
        },
        grade: {
            _id: false,
            type: {
                type: String,
                enum: Object.values(EGradeType),
                required: true
            },
            value: {
                type: Number,
                required: true
            }
        },
        startDate: {
            type: String,
            default: null
        },
        endDate: {
            type: String,
            default: null
        },
        standard: {
            type: String,
            default: null
        },
        board: {
            type: String,
            default: null
        },
        mediumOfInstruction: {
            type: String,
            default: null
        },
        stream: {
            type: String,
            default: null
        },
        major: {
            type: String,
            default: null
        },
        specialization: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
)

export default mongoose.model<IUserEducation>('userEducation', userEducationSchema)
