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
import { RescheduleCounsellingDTO } from '../constants/DTO/Counselling/RescheduleDTO'
import { meetingRequestTemplate } from '../constants/template/meetingRequestTemplate'
import { sendEmail } from '../service/nodemailerService'
import { formatDate } from '../utils/helper/syncHelpers'
import { meetingApprovalTemplate } from '../constants/template/meetingApprovalTemplate'
import { meetingRejectionTemplate } from '../constants/template/meetingRejectionTemplate'
import { getMeetingUrl } from '../service/gMeetService'

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

        const to = [institution.emailAddress]
        const formattedDate = formatDate(counselling.date)
        const subject = `Counselling Request: Scheduled by ${user.name} on ${formattedDate} at ${counselling.time}`
        const HTML = meetingRequestTemplate(user.name, formattedDate, counselling.time)
        await sendEmail(to, subject, HTML)

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

        if (counsellingMeeting.status === ECounsellingStatus.CANCELLED) {
            return {
                success: false,
                status: 400,
                message: 'Meeting has been cancelled',
                data: null
            }
        }

        const institution = await institutionModel.findById(counsellingMeeting.institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        const loggedInUser = await userModel.findById(loggedInUserId)
        if (!loggedInUser) {
            return {
                success: false,
                status: 404,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        if (loggedInUserId != institution.adminId.toString()) {
            return {
                success: false,
                status: 400,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const requestingUser = await userModel.findById(counsellingMeeting.userId)
        if(!requestingUser) {
            return {
                success: false,
                status: 400,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        counsellingMeeting.isApproved = approval

        const to = [institution.emailAddress]
        const formattedDate = formatDate(counsellingMeeting.date)
        let subject;
        let HTML 
        
        if (approval) {
            counsellingMeeting.meetingURL = getMeetingUrl(counsellingMeeting.date.toString(), counsellingMeeting.time)
            subject = `Counselling Request Approved: Scheduled on ${formattedDate} at ${counsellingMeeting.time} with ${institution.institutionName}`
            HTML = meetingApprovalTemplate(formattedDate, counsellingMeeting.time, counsellingMeeting.meetingURL)
            counsellingMeeting.status = ECounsellingStatus.APPROVED
        } else {
            subject = `Counselling Request Rejected`
            HTML = meetingRejectionTemplate(formattedDate, counsellingMeeting.time)
            counsellingMeeting.status = ECounsellingStatus.REJECTED
            counsellingMeeting.diApprovalReason = disapprovalReason ? disapprovalReason : null
        }
        
        await sendEmail(to, subject, HTML)
        await counsellingMeeting.save()

        return {
            success: true,
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

export const GetAllCounsellingMeeting = async (userId?: string, institutionId?: string, status?: string): Promise<ApiMessage> => {
    try {
        const query: Record<string, unknown> = {}

        if (userId) query.userId = userId
        if (institutionId) query.institutionId = institutionId
        if (status) {
            if (status === 'Upcoming') {
                query.status = { $in: [ECounsellingStatus.APPROVED, ECounsellingStatus.PENDING_APPROVAL] }
            } else {
                query.status = status
            }
        }

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

export const CancelCounsellingMeeting = async (userId: string, counsellingMeetingId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const counselling = await counsellingModel.findById(counsellingMeetingId)
        if (!counselling) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_REQUEST,
                data: null
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        if (userId !== counselling.userId.toString()) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        counselling.status = ECounsellingStatus.CANCELLED
        await counselling.save()

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: null
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

export const RescheduleCounsellingMeeting = async (meetingId: string, userId: string, input: RescheduleCounsellingDTO): Promise<ApiMessage> => {
    const { newDate, newTime } = input
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const meeting = await counsellingModel.findById(meetingId)
        if (!meeting) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Meeting'),
                data: null
            }
        }

        let institution

        if (user.institution.isAssociated) {
            institution = await institutionModel.findById(user.institution.institutionId)
        }

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        if (meeting.userId.toString() !== user._id.toString() && meeting.institutionId.toString() !== institution?._id.toString()) {
            return {
                success: false,
                status: 403,
                message: responseMessage.INTERNAL_SERVER_ERROR,
                data: null
            }
        }

        if (meeting.isApproved === false) {
            return {
                success: false,
                status: 400,
                message: 'Rescheduling is not allowed for disapproved meetings.',
                data: null
            }
        }

        meeting.date = new Date(newDate)
        meeting.time = newTime
        meeting.isApproved = null
        meeting.meetingURL = null
        meeting.status = ECounsellingStatus.PENDING_APPROVAL

        await meeting.save()

        return {
            success: true,
            status: 200,
            message: 'Meeting rescheduled successfully.',
            data: meeting
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

export const CompleteCounsellingMeeting = async (meetingId: string, institutionId: string): Promise<ApiMessage> => {
    try {
        const meeting = await counsellingModel.findById(meetingId)
        if (!meeting) {
            return {
                success: false,
                status: 404,
                message: 'Meeting not found.',
                data: null
            }
        }

        if (!meeting.isApproved) {
            return {
                success: false,
                status: 400,
                message: 'Meeting is not yet approved',
                data: null
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        if (meeting.institutionId.toString() !== institutionId) {
            return {
                success: false,
                status: 403,
                message: 'You are not authorized to complete this meeting.',
                data: null
            }
        }

        if (meeting.status === ECounsellingStatus.COMPLETED) {
            return {
                success: false,
                status: 400,
                message: 'Meeting is already marked as completed.',
                data: null
            }
        }

        meeting.status = ECounsellingStatus.COMPLETED
        await meeting.save()

        return {
            success: true,
            status: 200,
            message: 'Meeting marked as completed successfully.',
            data: meeting
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

export const GetAllBookedDate = async (userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        const bookedDates = await counsellingModel
            .find({
                userId: userId,
                status: { $nin: [ECounsellingStatus.REJECTED, ECounsellingStatus.CANCELLED] }
            })
            .select('date')

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: bookedDates
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

export const GetMeetingsForDashboard = async (userId: string): Promise<ApiMessage> => {
    try {
        const upcomingSessions = await counsellingModel
            .find({
                userId: userId,
                status: { $in: [ECounsellingStatus.APPROVED, ECounsellingStatus.PENDING_APPROVAL] }
            })
            .limit(5)
            .select('_id status date time purpose')
            .populate({ path: 'institutionId', select: '_id institutionName' })

        const completedSessions = await counsellingModel
            .find({
                userId: userId,
                status: ECounsellingStatus.COMPLETED
            })
            .limit(5)
            .limit(5)
            .select('_id status date time purpose')
            .populate({ path: 'institutionId', select: '_id institutionName' })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                upcomingSessions: upcomingSessions,
                completedSessions: completedSessions
            }
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
