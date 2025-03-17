import mongoose from 'mongoose'

export interface ICourseCategory {
    institutionId: mongoose.Schema.Types.ObjectId
    courseCategory: string[]
}
