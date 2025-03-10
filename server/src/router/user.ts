import { Router, Request, Response, NextFunction } from 'express'
import responseMessage from '../constants/responseMessage'
import { SelfIdentification } from '../controller/user'
import rateLimit from '../middleware/rateLimit'
import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
const router = Router()

/*
    Route: /api/v1/user/self-identification
    Method: GET
    Desc: Get user identity
    Access: Protected
    Query: userId
*/
router.get('/self-identification', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }

        const { success, status, message, data } = await SelfIdentification(accessToken)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})


export default router