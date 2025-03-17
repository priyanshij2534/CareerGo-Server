import mongoose from 'mongoose'
import { ICourseCategory } from '../../types/institutionTypes'

const courseCategorySchema = new mongoose.Schema<ICourseCategory>(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'institution',
            required: true
        },
        courseCategory: {
            type: [String],
            required: true
        }
    },
    { timestamps: true }
)

export default mongoose.model<ICourseCategory>('courseCategory', courseCategorySchema)
