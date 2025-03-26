import mongoose from 'mongoose'
import { CounsellingDTO } from '../constants/DTO/Counselling/CounsellingDTO'
import responseMessage from '../constants/responseMessage'
import { ICounselling } from '../types/counsellingTypes'
import { ApiMessage } from '../utils/ApiMessage'
import institutionModel from '../model/Institution/institutionModel'
import userModel from '../model/user/userModel'
import counsellingModel from '../model/Counselling/counsellingModel'
import { ApprovalDTO } from '../constants/DTO/Counselling/ApprovalDTO'
import { ECounsellingStatus } from '../constants/applicationEnums'

export const BookNewCounsellingMeeting = async (input: CounsellingDTO, userId: string): Promise<ApiMessage> => {
    const { date, time, institutionId, purpose } = input
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution')
            }
        }

        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        const payload: ICounselling = {
            userId: userId as unknown as mongoose.Schema.Types.ObjectId,
            institutionId: institutionId as unknown as mongoose.Schema.Types.ObjectId,
            date: new Date(date),
            time: time,
            status: ECounsellingStatus.PENDING_APPROVAL,
            purpose: purpose,
            isApproved: null,
            diApprovalReason: null,
            meetingURL: null
        }
        const counselling = await counsellingModel.create(payload)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: counselling
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errorMessage,
            data: null
        }
    }
}

export const ApproveCounsellingMeeting = async (input: ApprovalDTO, counsellingId: string, loggedInUserId: string): Promise<ApiMessage> => {
    const { approval, disapprovalReason } = input
    try {
        const counsellingMeeting = await counsellingModel.findById(counsellingId)
        if (!counsellingMeeting) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Counselling Meeting'),
                data: null
            }
        }

        const institution = await institutionModel.findById(counsellingMeeting.institutionId)

        const loggedInUser = await userModel.findById(loggedInUserId)
        if (loggedInUser?._id !== institution?.adminId) {
            return {
                success: false,
                status: 400,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        counsellingMeeting.isApproved = approval

        if (approval) {
            counsellingMeeting.meetingURL = 'https://meet.google.com/oae-vpbv-mdy'
            counsellingMeeting.status = ECounsellingStatus.APPROVED
        } else {
            counsellingMeeting.status = ECounsellingStatus.REJECTED
            counsellingMeeting.diApprovalReason = disapprovalReason ? disapprovalReason : null
        }

        await counsellingMeeting.save()

        return {
            success: false,
            status: 200,
            message: `Meeting has been ${counsellingMeeting.isApproved ? 'Approved' : 'Rejected'}`,
            data: counsellingMeeting
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errorMessage,
            data: null
        }
    }
}

// export const GetAllCounsellingMeeting = async (userId?: string, institutionId?: string, status?: ECounsellingStatus): Promise<ApiMessage> => {
//     try {
//         const query = {}

//         if (userId) Object.assign(query, userId)
//         if (institutionId) Object.assign(query, institutionId)
//         if (status) Object.assign(query, status)

//         const meetings = await counsellingModel
//             .find(query)
//             .populate({ path: 'userId', select: '_id name' })
//             .populate({ path: 'institutionId', select: '_id institutionName' })

//         return {
//             success: true,
//             status: 200,
//             message: responseMessage.SUCCESS,
//             data: meetings
//         }
//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
//         return {
//             success: false,
//             status: 500,
//             message: errorMessage,
//             data: null
//         }
//     }
// }

export const GetAllCounsellingMeeting = async (userId?: string, institutionId?: string, status?: ECounsellingStatus): Promise<ApiMessage> => {
    try {
        const query: Record<string, unknown> = {}

        if (userId) query.userId = userId
        if (institutionId) query.institutionId = institutionId
        if (status) query.status = status

        const meetings = await counsellingModel
            .find(query)
            .populate({ path: 'userId', select: '_id name' })
            .populate({ path: 'institutionId', select: '_id institutionName' })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: meetings
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errorMessage,
            data: null
        }
    }
}
