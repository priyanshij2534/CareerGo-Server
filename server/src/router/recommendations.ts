import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import rateLimit from '../middleware/rateLimit'
import authentication from '../middleware/authentication'
import responseMessage from '../constants/responseMessage'
import config from '../config/config'
import { VerifyToken } from '../utils/helper/syncHelpers'
import { IDecryptedJwt } from '../types/userTypes'
import { GetAllCourseCategory, GetRecommendations } from '../controller/recommendations'
const router = Router()

/*
    Route: /api/v1/recommendations
    Method: GET
    Desc: Get institution recommendations
    Access: Protected
*/
router.get('/', authentication, rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const { success, status, message, data } = await GetRecommendations(userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/recommendations/courseCategory
    Method: GET
    Desc: Get all unique course category
    Access: Protected
*/
router.get('/courseCategory', authentication, rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { success, status, message, data } = await GetAllCourseCategory()
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
