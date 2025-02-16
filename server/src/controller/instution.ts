import mongoose from 'mongoose'
import config from '../config/config'
import { EUserRole } from '../constants/applicationEnums'
import { CreateInstitutionDTO } from '../constants/DTO/Institution/CreateInstitutionDTO'
import responseMessage from '../constants/responseMessage'
import { emailVerificationTemplate } from '../constants/template/emailVerificationTemplate'
import institutionModel from '../model/Institution/institutionModel'
import userModel from '../model/user/userModel'
import { sendEmail } from '../service/nodemailerService'
import { IDecryptedJwt, IInstitution, IUser } from '../types/userTypes'
import { ApiMessage } from '../utils/ApiMessage'
import { EncryptPassword } from '../utils/helper/asyncHelpers'
import { GenerateRandomId, GenerateOTP, VerifyToken } from '../utils/helper/syncHelpers'
import { institutionRegistrationConfirmationTemplate } from '../constants/template/institutionRegistrationSuccesTemplate'

export const RegisterInstitution = async (input: CreateInstitutionDTO): Promise<ApiMessage> => {
    const { institutionName, adminName, logo, website, registrationNumber, emailAddress, password, conscent } = input
    try {
        const admin = await userModel.findOne({
            emailAddress: emailAddress
        })

        const institution = await institutionModel.findOne({
            emailAddress: emailAddress
        })
        if (admin || institution) {
            return {
                success: false,
                status: 422,
                message: responseMessage.ALREADY_IN_USE('EmailAddress'),
                data: null
            }
        }

        const encryptedPassword = await EncryptPassword(password)

        const token = GenerateRandomId()
        const code = GenerateOTP(6)

        const userPayload: IUser = {
            name: adminName,
            emailAddress: emailAddress,
            institution: {
                isAssociated: true,
                institutionId: null
            },
            accountConfirmation: {
                status: false,
                token: token,
                code: code,
                timestamp: null
            },
            passwordReset: {
                token: null,
                expiry: null,
                lastResetAt: null
            },
            password: encryptedPassword,
            role: EUserRole.Institution_ADMIN,
            lastLoginAt: null,
            consent: conscent
        }

        const newUser = await userModel.create(userPayload)

        const confirmationUrl = `${config.CLIENT_URL}/confirmation/${token}?code=${code}`
        const to = [emailAddress]
        const confirmAccountSubject = 'Confirm Your Account'
        const confirmAccountHTML = emailVerificationTemplate(confirmationUrl)
        await sendEmail(to, confirmAccountSubject, confirmAccountHTML)

        const institutionPayload: IInstitution = {
            institutionName: institutionName,
            emailAddress: emailAddress,
            logo: logo ? logo : null,
            website: website ? website : null,
            registrationNumber: registrationNumber,
            adminId: newUser.id as mongoose.Schema.Types.ObjectId,
            consent: conscent
        }

        const newInstitution = await institutionModel.create(institutionPayload)
        const institutionSetupSuccessSubject = 'Institution Registered successfully'
        const institutionSetupSuccessHTML = institutionRegistrationConfirmationTemplate(adminName, institutionName, registrationNumber)
        await sendEmail(to, institutionSetupSuccessSubject, institutionSetupSuccessHTML)

        newUser.institution.institutionId = newInstitution.id as mongoose.Schema.Types.ObjectId
        await newUser.save()

        return {
            success: true,
            status: 201,
            message: responseMessage.SUCCESS,
            data: {
                adminDetails: newUser,
                institutionDetails: newInstitution
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}

export const GetAllInstitutions = async (accessToken: string, page: number, limit: number, search: string | null): Promise<ApiMessage> => {
    const skip = (page - 1) * limit
    try {
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const roleBasedQueries: Record<string, object> = {
            [EUserRole.MASTER_ADMIN]: {},
            [EUserRole.ADMIN]: {}
        }

        const query = roleBasedQueries[user.role] || null
        if (!query) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        if (search) {
            const searchQuery = {
                $or: [{ name: { $regex: search, $options: 'i' } }, { emailAddress: { $regex: search, $options: 'i' } }]
            }
            Object.assign(query, searchQuery)
        }

        const totalCount = await institutionModel.countDocuments(query)
        const institutions = await institutionModel
            .find(query, 'institutionName emailAddress logo website registrationNumber consent adminId createdAt')
            .populate('adminId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                institutions: institutions,
                totalCount: totalCount,
                page: page,
                limit: limit
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}

export const GetInstitutionDetails = async (accessToken: string, institutionId: string): Promise<ApiMessage> => {
    try {
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        } else if (!user.institution.isAssociated) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        } else if (user.institution.institutionId !== (institutionId as unknown)) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        } else if (user.role === EUserRole.USER) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        const institutionAdmin = await userModel.findOne({
            'organisation.organisationId': institutionId,
            role: EUserRole.Institution_ADMIN
        })
        if (!institutionAdmin) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution admin'),
                data: null
            }
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                institution: institution,
                institutionAdmin: institutionAdmin
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}
