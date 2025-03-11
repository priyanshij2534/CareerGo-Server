import responseMessage from '../constants/responseMessage'
import userModel from '../model/user/userModel'
import { IDecryptedJwt, IUserAchievement, IUserCertification } from '../types/userTypes'
import { ApiMessage } from '../utils/ApiMessage'
import { VerifyToken } from '../utils/helper/syncHelpers'
import config from '../config/config'
import { UserBasicInfoDTO } from '../constants/DTO/User/Profile/UserBasicInfoDTO'
import userBasicInfoModel from '../model/user/Profile/userBasicInfoModel'
import { UserAchievementDTO } from '../constants/DTO/User/Profile/UserAchievementDTO'
import userAchievementModel from '../model/user/Profile/userAchievementModel'
import mongoose from 'mongoose'
import { UserCertificationDTO } from '../constants/DTO/User/Profile/UserCertificationDTO'
import userCertificationModel from '../model/user/Profile/userCertificationModel'

export const SelfIdentification = async (accessToken: string): Promise<ApiMessage> => {
    try {
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                userId: user._id,
                name: user.name,
                emailAddress: user.emailAddress
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

export const GetUserBasicInfo = async (userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        const userBasicInfo = await userBasicInfoModel.findOne({ userId: user.id })
        if (!userBasicInfo) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User Basic Info'),
                data: null
            }
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                basicInfo: userBasicInfo
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

export const UpdateBasicInfo = async (input: UserBasicInfoDTO, userId: string): Promise<ApiMessage> => {
    const { phone, dateOfBirth, gender, region, languages, skills, socialLinks } = input

    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        const userBasicInfo = await userBasicInfoModel.findOne({ userId: user.id })
        if (!userBasicInfo) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User Basic Info'),
                data: null
            }
        }

        let updated = false

        if (phone) {
            userBasicInfo.phone = phone
            updated = true
        }
        if (dateOfBirth) {
            userBasicInfo.dateOfBirth = new Date(dateOfBirth)
            updated = true
        }
        if (gender) {
            userBasicInfo.gender = gender
            updated = true
        }
        if (region) {
            userBasicInfo.region = region
            updated = true
        }

        if (languages?.length) {
            for (const language of languages) {
                const index = userBasicInfo.languages.findIndex((lang) => lang.name === language.name)
                if (index !== -1) {
                    userBasicInfo.languages[index] = language
                } else {
                    userBasicInfo.languages.push(language)
                }
            }
            updated = true
        }

        if (skills?.length) {
            userBasicInfo.skills = skills
            updated = true
        }

        if (socialLinks) {
            const index = userBasicInfo.socialLinks.findIndex((link) => link.platform === socialLinks.platform)
            if (index !== -1) {
                userBasicInfo.socialLinks[index] = socialLinks
            } else {
                userBasicInfo.socialLinks.push(socialLinks)
            }
            updated = true
        }

        if (updated) {
            await userBasicInfo.save()
            return {
                success: true,
                status: 200,
                message: responseMessage.SUCCESS,
                data: {
                    userBasicInfo
                }
            }
        } else {
            return {
                success: false,
                status: 400,
                message: 'No valid fields provided for update.',
                data: null
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

export const CreateUserAchievement = async (input: UserAchievementDTO, userId: string): Promise<ApiMessage> => {
    const { title, type, awardedBy, startDate, endDate, description } = input

    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        const achievementPayload: IUserAchievement = {
            userId: user.id as unknown as mongoose.Schema.Types.ObjectId,
            title: title,
            type: type,
            awardedBy: awardedBy,
            startDate: startDate,
            endDate: endDate ? endDate : null,
            description: description ? description : null
        }

        const newAchievement = await userAchievementModel.create(achievementPayload)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                achievement: newAchievement
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

export const GetAllUserAchievement = async (userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        const allAchievement = await userAchievementModel.find({
            userId: user.id
        })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                achievements: allAchievement
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

export const UpdateUserAchievement = async (input: Partial<UserAchievementDTO>, achievementId: string, userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        let userAchievement = await userAchievementModel.findById(achievementId)
        if (!userAchievement) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User Achievement'),
                data: null
            }
        }
        if (user.id != userAchievement.userId) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        userAchievement = await userAchievementModel.findByIdAndUpdate(achievementId, input, { new: true })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                achievement: userAchievement
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

export const DeleteUserAchievement = async (achievementId: string, userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        const userAchievement = await userAchievementModel.findById(achievementId)
        if (!userAchievement) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User Achievement'),
                data: null
            }
        }
        if (user.id != userAchievement.userId) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        await userAchievementModel.deleteOne({ _id: achievementId })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                achievement: userAchievement
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

export const CreateUserCertification = async (input: UserCertificationDTO, userId: string): Promise<ApiMessage> => {
    const { title, issuedBy, startDate, endDate, expiryDate } = input

    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        const certificationPayload: IUserCertification = {
            userId: user.id as unknown as mongoose.Schema.Types.ObjectId,
            title: title,
            issuedBy: issuedBy,
            startDate: startDate,
            endDate: endDate ? endDate : null,
            expiryDate: expiryDate ? expiryDate : null
        }

        const newCertification = await userCertificationModel.create(certificationPayload)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                certification: newCertification
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

export const GetAllUserCertification = async (userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        const allCertifications = await userCertificationModel.find({
            userId: user.id
        })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                certifications: allCertifications
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

export const UpdateUserCertifications = async (
    input: Partial<UserCertificationDTO>,
    certificationId: string,
    userId: string
): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        let userCertification = await userCertificationModel.findById(certificationId)
        if (!userCertification) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User Certification'),
                data: null
            }
        }
        if (user.id != userCertification.userId) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        userCertification = await userCertificationModel.findByIdAndUpdate(certificationId, input, { new: true })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                certification: userCertification
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

export const DeleteUserCertification = async (certificationId: string, userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        const userCertification = await userCertificationModel.findById(certificationId)
        if (!userCertification) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User Achievement'),
                data: null
            }
        }
        if (user.id != userCertification.userId) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        await userAchievementModel.deleteOne({ _id: certificationId })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                certification: userCertification
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
