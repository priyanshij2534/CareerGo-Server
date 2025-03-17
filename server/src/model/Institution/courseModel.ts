import mongoose from 'mongoose'
import { ICourse } from '../../types/institutionTypes'
import { ECourseMode } from '../../constants/applicationEnums'

const courseSchema = new mongoose.Schema<ICourse>(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'institution',
            required: true
        },
        courseName: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: Number,
            required: true
        },
        eligibility: {
            type: String,
            required: true,
            trim: true
        },
        mode: {
            type: String,
            enum: Object.values(ECourseMode),
            required: true
        },
        fees: {
            type: Number,
            required: true
        },
        syllabus: {
            type: [String],
            required: true
        },
        admissionProcess: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        website: {
            type: String,
            required: true,
            trim: true
        },
        brochure: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
)

export default mongoose.model<ICourse>('course', courseSchema)
