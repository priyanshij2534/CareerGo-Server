import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import rateLimit from '../middleware/rateLimit'
import { CreateInstitutionDTO } from '../constants/DTO/Institution/CreateInstitutionDTO'
import { GetAllInstitutions, GetInstitutionDetails, RegisterInstitution } from '../controller/instution'
import authentication from '../middleware/authentication'
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
    Route: /api/v1/institution/getDetails/:institutionId
    Method: GET
    Desc: Get institution details
    Access: Protected
    Path variable: institutionId
*/
router.get('/getDetails/:institutionId', authentication, rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string }

        const institutionId: string = req.params.institutionId 

        const { success, status, message, data } = await GetInstitutionDetails(accessToken, institutionId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
