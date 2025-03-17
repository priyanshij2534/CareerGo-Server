import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import rateLimit from '../middleware/rateLimit'
import { CreateInstitutionDTO } from '../constants/DTO/Institution/CreateInstitutionDTO'
import {
    CreateNewCourseCategory,
    DeleteCourseCategory,
    GetAllInstitutions,
    GetCourseCategory,
    GetInstitutionDetails,
    RegisterInstitution,
    UpdateInstitutionDetails,
    UpdateInstitutionLogo
} from '../controller/instution'
import authentication from '../middleware/authentication'
import responseMessage from '../constants/responseMessage'
import { UpdateInstitutionDetailsDTO } from '../constants/DTO/Institution/UpdateInstitutionDetailsDTO'
import { CourseCategoryDTO } from '../constants/DTO/Institution/CourseCategory'
const router = Router()

/*
    Route: /api/v1/institution/create
    Method: POST
    Desc: Register a new institution
    Access: Public
    Body: CreateInstitutionDTO
*/
router.post('/create', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: object = req.body as object

        const requestValidation = await validateDTO(CreateInstitutionDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await RegisterInstitution(req.body as CreateInstitutionDTO)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/getAll
    Method: GET
    Desc: Get all institutions
    Access: Protected
    Query: page, limit, search
*/
router.get('/getAll', authentication, rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string }

        const page: number = req.query.page ? Number(req.query.page) : 1
        const limit: number = req.query.limit ? Number(req.query.limit) : 10
        const search: string = req.query.search as string

        const { success, status, message, data } = await GetAllInstitutions(accessToken, page, limit, search)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/details/:institutionId
    Method: GET
    Desc: Get institution details
    Access: Protected
    Path variable: institutionId
*/
router.get('/details/:institutionId', authentication, rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const { success, status, message, data } = await GetInstitutionDetails(institutionId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/logo/:institutionId
    Method: PUT
    Desc: Update institution logo
    Access: Protected
    Path variable: institutionId
    Query: logo
*/
router.put('/logo/:institutionId', authentication, rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const logo = req.query.logo as string
        if (!logo) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const { success, status, message, data } = await UpdateInstitutionLogo(logo, institutionId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/details/:institutionId
    Method: PUT
    Desc: Update institution details
    Access: Protected
    Body: UpdateInstitutionDetailsDTO
*/
router.put('/details/:institutionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const body: object = req.body as object

        const requestValidation = await validateDTO(UpdateInstitutionDetailsDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await UpdateInstitutionDetails(req.body as UpdateInstitutionDetailsDTO, institutionId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/courseCategory/:institutionId
    Method: POST
    Desc: Create new institution course category
    Access: Protected
    Body: CourseCategoryDTO
*/
router.post('/courseCategory/:institutionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const body: object = req.body as object

        const requestValidation = await validateDTO(CourseCategoryDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await CreateNewCourseCategory(req.body as CourseCategoryDTO, institutionId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/courseCategory/:institutionId
    Method: GET
    Desc: Get institution course category
    Access: Protected
    Path variable: institutionId
*/
router.get('/courseCategory/:institutionId', authentication, rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const { success, status, message, data } = await GetCourseCategory(institutionId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/courseCategory/:institutionId
    Method: DELETE
    Desc: Delete new institution course category
    Access: Protected
    Body: CourseCategoryDTO
*/
router.delete('/courseCategory/:institutionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const body: object = req.body as object

        const requestValidation = await validateDTO(CourseCategoryDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await DeleteCourseCategory(req.body as CourseCategoryDTO, institutionId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
