import { ApiMessage } from '../utils/ApiMessage'
import responseMessage from '../constants/responseMessage'
import { sendEmail } from '../service/nodemailerService'
import { SendBulkEmailDTO } from '../constants/DTO/Email/SendBulkEmailDTO'
import { SendEmailDTO } from '../constants/DTO/Email/SendEmailDTO'

export const SendBulkEmail = async (input: SendBulkEmailDTO): Promise<ApiMessage> => {
    const {emailAddresses, subject, body} = input
    try {
        await sendEmail(emailAddresses, subject, body)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: null
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errorMessage
        }
    }
}

export const SendSingleEmail = async (input: SendEmailDTO): Promise<ApiMessage> => {
    const {emailAddress, subject, body} = input
    try {
        await sendEmail([emailAddress], subject, body)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: null
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errorMessage
        }
    }
}

export const SendMultipleEmail = async (input: SendBulkEmailDTO): Promise<ApiMessage> => {
    const {emailAddresses, subject, body} = input
    try {
        await Promise.all(emailAddresses.map(async (emailAddress) => {
            await sendEmail([emailAddress], subject, body)
        }))
            
        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: null
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errorMessage
        }
    }
}
