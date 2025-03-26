import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import rateLimit from '../middleware/rateLimit'
import { ApproveCounsellingMeeting, BookNewCounsellingMeeting, GetAllCounsellingMeeting } from '../controller/counselling'
import { CounsellingDTO } from '../constants/DTO/Counselling/CounsellingDTO'
import responseMessage from '../constants/responseMessage'
import { VerifyToken } from '../utils/helper/syncHelpers'
import { IDecryptedJwt } from '../types/userTypes'
import config from '../config/config'
import { ApprovalDTO } from '../constants/DTO/Counselling/ApprovalDTO'
import { ECounsellingStatus } from '../constants/applicationEnums'
const router = Router()

/*
    Route: /api/v1/counselling/request
    Method: POST
    Desc: Book new counselling session
    Access: Protected
    Body: CounsellingDTO
*/
router.post('/request', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const body: object = req.body as object

        const requestValidation = await validateDTO(CounsellingDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await BookNewCounsellingMeeting(req.body as CounsellingDTO, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/counselling
    Method: PUT
    Desc: Gell all counselling session
    Access: Protected
    Query parameter: userId, status, institutionId
*/
router.get('/', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.query.userId as string
        const counsellingMeetingStatus = req.query.status as string as ECounsellingStatus
        const institutionId = req.query.institutionId as string

        const { success, status, message, data } = await GetAllCounsellingMeeting(userId, institutionId, counsellingMeetingStatus)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/counselling/approve/:counsellingId
    Method: PUT
    Desc: Approve a counselling session
    Access: Protected
    Body: ApprovalDTO
    Path variable: counsellingId
*/
router.put('/approve/:counsellingId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const counsellingId = req.params.counsellingId

        const body: object = req.body as object

        const requestValidation = await validateDTO(ApprovalDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await ApproveCounsellingMeeting(req.body as ApprovalDTO, counsellingId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
