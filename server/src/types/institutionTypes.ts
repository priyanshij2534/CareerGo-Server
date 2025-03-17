import mongoose from 'mongoose'
import { ECourseMode } from '../constants/applicationEnums'

export interface ICourseCategory {
    institutionId: mongoose.Schema.Types.ObjectId
    courseCategory: string[]
}

export interface ICourse {
    institutionId: mongoose.Schema.Types.ObjectId
    courseName: string
    category : string
    duration: number
    eligibility: string
    mode: ECourseMode
    fees: number
    syllabus: string[]
    admissionProcess: string
    email: string
    phone: string
    website: string
    brochure: string | null
}