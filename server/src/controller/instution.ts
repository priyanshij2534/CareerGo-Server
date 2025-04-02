import mongoose from 'mongoose'
import config from '../config/config'
import { EUserRole } from '../constants/applicationEnums'
import { CreateInstitutionDTO } from '../constants/DTO/Institution/CreateInstitutionDTO'
import responseMessage from '../constants/responseMessage'
import { emailVerificationTemplate } from '../constants/template/emailVerificationTemplate'
import institutionModel from '../model/Institution/institutionModel'
import userModel from '../model/user/userModel'
import { sendEmail } from '../service/nodemailerService'
import { IInstitution, IUser, IUserBasicInfo } from '../types/userTypes'
import { ApiMessage } from '../utils/ApiMessage'
import { EncryptPassword } from '../utils/helper/asyncHelpers'
import { GenerateRandomId, GenerateOTP } from '../utils/helper/syncHelpers'
import { institutionRegistrationConfirmationTemplate } from '../constants/template/institutionRegistrationSuccesTemplate'
import userBasicInfoModel from '../model/user/Profile/userBasicInfoModel'
import courseCategoryModel from '../model/Institution/courseCategoryModel'
import { ICourse, ICourseCategory } from '../types/institutionTypes'
import { CourseCategoryDTO } from '../constants/DTO/Institution/CourseCategoryDTO'
import { UpdateInstitutionDetailsDTO } from '../constants/DTO/Institution/UpdateInstitutionDetailsDTO'
import { CourseDTO } from '../constants/DTO/Institution/CourseDTO'
import courseModel from '../model/Institution/courseModel'

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
            if (admin && institution) {
                if (admin.accountConfirmation.status) {
                    return {
                        success: false,
                        status: 422,
                        message: responseMessage.ALREADY_EXISTS('User', 'emailAddress'),
                        data: null
                    }
                }

                const deleteAdminResult = await userModel.deleteOne({ _id: admin._id })
                const deleteInstitutionResult = await institutionModel.deleteOne({ _id: institution._id })

                if (deleteAdminResult.deletedCount === 0 && deleteInstitutionResult.deletedCount === 0) {
                    return {
                        success: false,
                        status: 500,
                        message: 'Failed to delete existing unconfirmed institution.',
                        data: null
                    }
                }
            }
        }

        const encryptedPassword = await EncryptPassword(password)

        const token = GenerateRandomId()
        const code = GenerateOTP(6)

        const userPayload: IUser = {
            name: adminName,
            emailAddress: emailAddress,
            profileImage: null,
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
            userProfileProgress: 0,
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
            consent: conscent,
            admission: false,
            hostel: true
        }

        const newInstitution = await institutionModel.create(institutionPayload)
        const institutionSetupSuccessSubject = 'Institution Registered successfully'
        const institutionSetupSuccessHTML = institutionRegistrationConfirmationTemplate(adminName, institutionName, registrationNumber)
        await sendEmail(to, institutionSetupSuccessSubject, institutionSetupSuccessHTML)

        newUser.institution.institutionId = newInstitution.id as mongoose.Schema.Types.ObjectId
        await newUser.save()

        const basicInfoPayload: IUserBasicInfo = {
            userId: newUser.id as unknown as mongoose.Schema.Types.ObjectId,
            phone: null,
            dateOfBirth: null,
            gender: null,
            region: null,
            languages: [],
            skills: [],
            socialLinks: []
        }
        await userBasicInfoModel.create(basicInfoPayload)

        const courseCategoryPayload: ICourseCategory = {
            institutionId: newInstitution.id as unknown as mongoose.Schema.Types.ObjectId,
            courseCategory: []
        }
        await courseCategoryModel.create(courseCategoryPayload)

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

export const GetAllInstitutions = async (
    page: number,
    limit: number,
    search?: string | null,
    minFeesRange?: number | null,
    maxFeesRange?: number | null,
    hostel?: boolean | null,
    admission?: boolean | null,
    courseCategory?: string[] | []
): Promise<ApiMessage> => {
    const skip = (page - 1) * limit
    try {
        const query: Record<string, unknown> = {}

        if (search) {
            query.institutionName = { $regex: search, $options: 'i' }
        }
        if (typeof hostel === 'boolean') {
            query.hostel = hostel
        }
        if (typeof admission === 'boolean') {
            query.admission = admission
        }

        const institutions = await institutionModel.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'courses',
                    let: { institutionId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$institutionId', '$$institutionId'] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                minFees: { $min: '$fees' },
                                maxFees: { $max: '$fees' }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                minFees: 1,
                                maxFees: 1
                            }
                        }
                    ],
                    as: 'courseFees'
                }
            },
            {
                $lookup: {
                    from: 'coursecategories',
                    let: { institutionId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$institutionId', '$$institutionId'] }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                courseCategory: 1
                            }
                        }
                    ],
                    as: 'courseCategories'
                }
            },
            {
                $addFields: {
                    courseCategories: {
                        $reduce: {
                            input: '$courseCategories',
                            initialValue: [],
                            in: { $concatArrays: ['$$value', '$$this.courseCategory'] }
                        }
                    },
                    minCourseFees: { $arrayElemAt: ['$courseFees.minFees', 0] },
                    maxCourseFees: { $arrayElemAt: ['$courseFees.maxFees', 0] }
                }
            },
            {
                $match: {
                    ...(minFeesRange !== null && minFeesRange !== undefined ? { minCourseFees: { $gte: minFeesRange } } : {}),
                    ...(maxFeesRange !== null && maxFeesRange !== undefined ? { maxCourseFees: { $lte: maxFeesRange } } : {}),
                    ...(courseCategory && courseCategory.length > 0 ? { courseCategories: { $in: courseCategory } } : {})
                }
            },
            {
                $project: {
                    _id: 1,
                    institutionName: 1,
                    logo: 1,
                    website: 1,
                    registrationNumber: 1,
                    admission: 1,
                    hostel: 1,
                    minCourseFees: 1,
                    maxCourseFees: 1,
                    courseCategories: 1
                }
            },
            { $skip: skip },
            { $limit: limit }
        ])

        const totalCount = await institutionModel.countDocuments(query)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                institutions,
                totalCount,
                page,
                limit
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

export const GetInstitutionDetails = async (institutionId: string): Promise<ApiMessage> => {
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        const admin = await userModel.findById(institution.adminId)
        if (!admin) {
            return {
                success: false,
                status: 401,
                message: responseMessage.NOT_FOUND('Institution admin'),
                data: null
            }
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                institution: {
                    name: institution.institutionName,
                    url: institution.website,
                    logo: institution.logo,
                    admission: institution.admission,
                    adminName: admin.name
                }
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

export const UpdateInstitutionLogo = async (logo: string, institutionId: string): Promise<ApiMessage> => {
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        institution.logo = logo
        await institution.save()

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: null
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

export const UpdateInstitutionDetails = async (input: UpdateInstitutionDetailsDTO, institutionId: string): Promise<ApiMessage> => {
    const { admission, website } = input
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        let update = false

        if (website) {
            institution.website = website
            update = true
        }

        if (admission !== undefined) {
            institution.admission = admission
            update = true
        }

        if (update) {
            await institution.save()
            return {
                success: true,
                status: 200,
                message: responseMessage.SUCCESS,
                data: null
            }
        }

        return {
            success: false,
            status: 400,
            message: responseMessage.INVALID_REQUEST,
            data: null
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

export const CreateNewCourseCategory = async (input: CourseCategoryDTO, institutionId: string): Promise<ApiMessage> => {
    const { courseCategory } = input
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        const institutionCourseCategory = await courseCategoryModel.findOne({
            institutionId: institutionId
        })

        institutionCourseCategory?.courseCategory.push(courseCategory)
        await institutionCourseCategory?.save()

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: null
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

export const DeleteCourseCategory = async (categoryName: string, institutionId: string): Promise<ApiMessage> => {
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        const institutionCourseCategory = await courseCategoryModel.findOne({
            institutionId: institutionId
        })

        if (!institutionCourseCategory) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Course Category'),
                data: null
            }
        }

        const categoryIndex = institutionCourseCategory.courseCategory.indexOf(categoryName)
        if (categoryIndex === -1) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Course Category'),
                data: null
            }
        }

        await courseModel.deleteMany({
            category: categoryName
        })

        institutionCourseCategory.courseCategory.splice(categoryIndex, 1)
        await institutionCourseCategory.save()

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: null
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

export const GetCourseCategory = async (institutionId: string): Promise<ApiMessage> => {
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        const institutionCourseCategory = await courseCategoryModel.findOne({
            institutionId: institutionId
        })

        if (!institutionCourseCategory) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Course Category'),
                data: null
            }
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                courseCategory: institutionCourseCategory
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

export const CreateNewCourse = async (input: CourseDTO, institutionId: string): Promise<ApiMessage> => {
    const { courseName, category, duration, eligibility, mode, fees, syllabus, admissionProcess, email, phone, website, brochure } = input
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        const institutionCourseCategory = await courseCategoryModel.findOne({ institutionId: institutionId })
        if (!institutionCourseCategory) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Course Category'),
                data: null
            }
        }

        const index = institutionCourseCategory.courseCategory.findIndex((categoryItem) => categoryItem === category)
        if (index === -1) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Course Category'),
                data: null
            }
        }

        const coursePayload: ICourse = {
            institutionId: institutionId as unknown as mongoose.Schema.Types.ObjectId,
            courseName: courseName,
            category: category,
            duration: duration,
            eligibility: eligibility,
            mode: mode,
            fees: fees,
            syllabus: syllabus,
            admissionProcess: admissionProcess,
            email: email,
            phone: phone,
            website: website,
            brochure: brochure ? brochure : null
        }

        const course = await courseModel.create(coursePayload)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                course: course
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

export const GetAllCourse = async (institutionId: string, category?: string[], search?: string): Promise<ApiMessage> => {
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        // Ensure category is an array and search is a string
        const categoryFilter = category && category.length > 0 ? { category: { $in: category } } : {}
        const searchFilter = search ? { courseName: { $regex: search, $options: 'i' } } : {}

        const courses = await courseModel
            .find({
                institutionId,
                ...categoryFilter,
                ...searchFilter
            })
            .select('courseName category duration eligibility mode')

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: { courses }
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

export const GetCourseDetail = async (institutionId: string, courseId: string): Promise<ApiMessage> => {
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        const course = await courseModel.findById(courseId)
        if (!course) {
            return {
                success: false,
                status: 401,
                message: responseMessage.NOT_FOUND('Course'),
                data: null
            }
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                course: course
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

export const UpdateCourse = async (input: Partial<CourseDTO>, institutionId: string, courseId: string): Promise<ApiMessage> => {
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        let course = await courseModel.findById(courseId)
        if (!course) {
            return {
                success: false,
                status: 401,
                message: responseMessage.NOT_FOUND('Course'),
                data: null
            }
        }

        course = await courseModel.findByIdAndUpdate(courseId, input, { new: true })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                course: course
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

export const DeleteCourse = async (institutionId: string, courseId: string): Promise<ApiMessage> => {
    try {
        const institution = await institutionModel.findById(institutionId)
        if (!institution) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Institution'),
                data: null
            }
        }

        const course = await courseModel.findById(courseId)
        if (!course) {
            return {
                success: false,
                status: 401,
                message: responseMessage.NOT_FOUND('Course'),
                data: null
            }
        }

        await course.deleteOne({
            _id: courseId
        })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                course: course
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

export const GetAllInstitutionList = async (page: number, limit: number, search: string | null): Promise<ApiMessage> => {
    const skip = (page - 1) * limit

    try {
        const query = {}

        if (search) {
            const searchQuery = {
                $or: [{ name: { $regex: search, $options: 'i' } }, { emailAddress: { $regex: search, $options: 'i' } }]
            }
            Object.assign(query, searchQuery)
        }

        const institutionList = await institutionModel.find(query).select('institutionName _id').skip(skip).limit(limit)
        const institutionCount = await institutionModel.countDocuments(query)

        return {
            success: true,
            status: 200,
            message: 'Institutiom list fetched',
            data: { institutionList: institutionList, page: page, limit: limit, total: institutionCount }
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
