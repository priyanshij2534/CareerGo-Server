import mongoose from 'mongoose'
import { ECounsellingStatus } from '../constants/applicationEnums'

export interface ICounselling {
    userId: mongoose.Schema.Types.ObjectId
    institutionId: mongoose.Schema.Types.ObjectId
    status: ECounsellingStatus
    date: Date
    time: string
    purpose: string
    isApproved: boolean | null
    diApprovalReason: string | null
    meetingURL: string | null
}
