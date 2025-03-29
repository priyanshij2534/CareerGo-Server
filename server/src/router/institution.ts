import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import rateLimit from '../middleware/rateLimit'
import { CreateInstitutionDTO } from '../constants/DTO/Institution/CreateInstitutionDTO'
import {
    CreateNewCourse,
    CreateNewCourseCategory,
    DeleteCourse,
    DeleteCourseCategory,
    GetAllCourse,
    GetAllInstitutionList,
    GetAllInstitutions,
    GetCourseCategory,
    GetCourseDetail,
    GetInstitutionDetails,
    RegisterInstitution,
    UpdateCourse,
    UpdateInstitutionDetails,
    UpdateInstitutionLogo
} from '../controller/instution'
import authentication from '../middleware/authentication'
import responseMessage from '../constants/responseMessage'
import { UpdateInstitutionDetailsDTO } from '../constants/DTO/Institution/UpdateInstitutionDetailsDTO'
import { CourseCategoryDTO } from '../constants/DTO/Institution/CourseCategoryDTO'
import { CourseDTO } from '../constants/DTO/Institution/CourseDTO'
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
    Query: page, limit, search, minFeesRange, maxFeesRange, hostel, admission, courseCategory
*/
router.get('/getAll', authentication, rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page: number = req.query.page ? Number(req.query.page) : 1
        const limit: number = req.query.limit ? Number(req.query.limit) : 10
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const search: string | null = req.query.search ? String(req.query.search) : null
        const minFeesRange: number | null = req.query.minFeesRange ? Number(req.query.minFeesRange) : null
        const maxFeesRange: number | null = req.query.maxFeesRange ? Number(req.query.maxFeesRange) : null
        const hostel: boolean | null = req.query.hostel ? req.query.hostel === 'true' : null
        const admission: boolean | null = req.query.admission ? req.query.admission === 'true' : null
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const courseCategory: string[] | [] = req.query.courseCategory ? String(req.query.courseCategory).split(',') : []

        const { success, status, message, data } = await GetAllInstitutions(
            page,
            limit,
            search,
            minFeesRange,
            maxFeesRange,
            hostel,
            admission,
            courseCategory
        )
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
    Body: courseName
*/
router.delete('/courseCategory/:institutionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const categoryName = req.query.categoryName as string
        if (!categoryName) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const { success, status, message, data } = await DeleteCourseCategory(categoryName, institutionId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/course/:institutionId
    Method: POST
    Desc: Create a new institution course
    Access: Public
    Body: CourseDTO
    Path variables: institutionId
*/
router.post('/course/:institutionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const body: object = req.body as object

        const requestValidation = await validateDTO(CourseDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await CreateNewCourse(req.body as CourseDTO, institutionId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/course/all/:institutionId
    Method: GET
    Desc: Get all institution course
    Access: Public
    Path variables: institutionId
    Query: category, search
*/
router.get('/course/all/:institutionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const category: string[] = req.query.category ? (req.query.category as string).split(',') : []
        const search: string = (req.query.search as string) || ''

        const { success, status, message, data } = await GetAllCourse(institutionId, category, search)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/course/detail/:institutionId
    Method: GET
    Desc: Get institution course details
    Access: Public
    Path variables: institutionId
    Query Parameter: courseId
*/
router.get('/course/detail/:institutionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const courseId: string = req.query.courseId as string
        if (!courseId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const { success, status, message, data } = await GetCourseDetail(institutionId, courseId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/course/:institutionId
    Method: POST
    Desc: Update an institution course
    Access: Public
    Path variables: institutionId
    Query Parameter: courseId
*/
router.put('/course/:institutionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const courseId: string = req.query.courseId as string
        if (!courseId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const { success, status, message, data } = await UpdateCourse(req.body as Partial<CourseDTO>, institutionId, courseId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/course/:institutionId
    Method: Delete
    Desc: Delete an institution course
    Access: Public
    Path variables: institutionId
    Query Parameter: courseId
*/
router.delete('/course/:institutionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const institutionId: string = req.params.institutionId
        if (!institutionId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const courseId: string = req.query.courseId as string
        if (!courseId) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_REQUEST)
        }

        const { success, status, message, data } = await DeleteCourse(institutionId, courseId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/institution/getAllInstitutionList
    Method: GET
    Desc: Get all institutions list for dropdown
    Access: Protected
    Query: page, limit, search
*/
router.get('/getAllInstitutionList', authentication, rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page: number = req.query.page ? Number(req.query.page) : 1
        const limit: number = req.query.limit ? Number(req.query.limit) : 10
        const search: string = req.query.search as string

        const { success, status, message, data } = await GetAllInstitutionList(page, limit, search)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
