import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import rateLimit from '../middleware/rateLimit'
import { SendBulkEmailDTO } from '../constants/DTO/Email/SendBulkEmailDTO'
import { SendSingleEmail, SendBulkEmail, SendMultipleEmail } from '../controller/mailer'
import { SendEmailDTO } from '../constants/DTO/Email/SendEmailDTO'
const router = Router()

/*
    Route: /api/v1/send/email
    Method: POST
    Desc: Send an email
    Access: Public
    Body: SendEmailDTO
*/
router.post('/', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: object = req.body as object

        const requestValidation = await validateDTO(SendEmailDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await SendSingleEmail(req.body as SendEmailDTO)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/send/email/bulk
    Method: POST
    Desc: Send bulk email
    Access: Public
    Body: SendBulkEmailDTO
*/
router.post('/bulk', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: object = req.body as object

        const requestValidation = await validateDTO(SendBulkEmailDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await SendBulkEmail(req.body as SendBulkEmailDTO)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/send/email/multiple
    Method: POST
    Desc: Send email to multiple address
    Access: Public
    Body: SendBulkEmailDTO
*/
router.post('/multiple', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: object = req.body as object

        const requestValidation = await validateDTO(SendBulkEmailDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await SendMultipleEmail(req.body as SendBulkEmailDTO)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router