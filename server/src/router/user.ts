import { Router, Request, Response, NextFunction } from 'express'
import responseMessage from '../constants/responseMessage'
import {
    CreateUserAchievement,
    CreateUserCertification,
    DeleteUserAchievement,
    DeleteUserCertification,
    GetAllUserAchievement,
    GetAllUserCertification,
    GetUserBasicInfo,
    SelfIdentification,
    UpdateBasicInfo,
    UpdateUserAchievement,
    UpdateUserCertifications
} from '../controller/user'
import rateLimit from '../middleware/rateLimit'
import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import config from '../config/config'
import { UserBasicInfoDTO } from '../constants/DTO/User/Profile/UserBasicInfoDTO'
import { IDecryptedJwt } from '../types/userTypes'
import DtoError from '../utils/DtoError'
import { VerifyToken } from '../utils/helper/syncHelpers'
import { validateDTO } from '../utils/validateDto'
import { UserAchievementDTO } from '../constants/DTO/User/Profile/UserAchievementDTO'
import { UserCertificationDTO } from '../constants/DTO/User/Profile/UserCertificationDTO'
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

/*
    Route: /api/v1/user/basicInfo
    Method: PUT
    Desc: Update user basic Info
    Access: Protected
    Body: UserBasicInfoDTO
*/
router.put('/basicInfo', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const body: object = req.body as object

        const requestValidation = await validateDTO(UserBasicInfoDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await UpdateBasicInfo(req.body as UserBasicInfoDTO, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/basicInfo
    Method: GET
    Desc: Get user basic Info
    Access: Protected
*/
router.get('/basicInfo', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const { success, status, message, data } = await GetUserBasicInfo(userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/achievement
    Method: POST
    Desc: Create user achievement
    Access: Protected
    Body: UserAchievementDTO
*/
router.post('/achievement', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const body: object = req.body as object

        const requestValidation = await validateDTO(UserAchievementDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await CreateUserAchievement(req.body as UserAchievementDTO, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/achievement
    Method: GET
    Desc: Get all user achievement
    Access: Protected
*/
router.get('/achievement', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const { success, status, message, data } = await GetAllUserAchievement(userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/achievement/:achievementId
    Method: PUT
    Desc: Update user achievement
    Access: Protected
    Body: Partial<UserAchievementDTO>
    Paramas: achievementId
*/
router.put('/achievement/:achievementId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const achievementId = req.params.achievementId

        const { success, status, message, data } = await UpdateUserAchievement(req.body as Partial<UserAchievementDTO>, achievementId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/achievement/:achievementId
    Method: DELETE
    Desc: Delete user achievement
    Access: Protected
    Paramas: achievementId
*/
router.delete('/achievement/:achievementId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const achievementId = req.params.achievementId

        const { success, status, message, data } = await DeleteUserAchievement(achievementId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/certification
    Method: POST
    Desc: Create user certification
    Access: Protected
    Body: UserCertificationDTO
*/
router.post('/certification', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const body: object = req.body as object

        const requestValidation = await validateDTO(UserCertificationDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await CreateUserCertification(req.body as UserCertificationDTO, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/certification
    Method: GET
    Desc: Get all user certifications
    Access: Protected
*/
router.get('/certification', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const { success, status, message, data } = await GetAllUserCertification(userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/certification/:certificationId
    Method: PUT
    Desc: Update user certification
    Access: Protected
    Body: Partial<UserCertificationDTO>
    Paramas: achievementId
*/
router.put('/certification/:certificationId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const certificationId = req.params.certificationId

        const { success, status, message, data } = await UpdateUserCertifications(req.body as Partial<UserCertificationDTO>, certificationId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/certification/:certificationId
    Method: DELETE
    Desc: Delete user certification
    Access: Protected
    Paramas: achievementId
*/
router.delete('/certification/:certificationId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const certificationId = req.params.certificationId

        const { success, status, message, data } = await DeleteUserCertification(certificationId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
