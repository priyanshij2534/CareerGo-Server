// import mongoose from 'mongoose'
// import config from '../config/config'
// import axios from 'axios'
// import userAchievementModel from '../model/user/Profile/userAchievementModel'
// import userBasicInfoModel from '../model/user/Profile/userBasicInfoModel'
// import userCertificationModel from '../model/user/Profile/userCertificationModel'
// import userEducationModel from '../model/user/Profile/userEducationModel'
import responseMessage from '../constants/responseMessage'
import institutionModel from '../model/Institution/institutionModel'
import userModel from '../model/user/userModel'
import { ApiMessage } from '../utils/ApiMessage'
import courseCategoryModel from '../model/Institution/courseCategoryModel'
import courseModel from '../model/Institution/courseModel'

export const GetRecommendations = async (userId: string): Promise<ApiMessage> => {
    try {
        // const intrestCourse = ['B.Tech']

        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        // const userBasicInfo = await userBasicInfoModel
        //     .findOne({
        //         userId: userId
        //     })
        //     .select('gender region languages skills')

        // const userEducation = await userEducationModel
        //     .find({
        //         userId: userId
        //     })
        //     .select('-userId -createdAt -updatedAt -__v')

        // const userAchievements = await userAchievementModel
        //     .find({
        //         userId: userId
        //     })
        //     .select('-userId -createdAt -updatedAt -__v')

        // const userCertifications = await userCertificationModel
        //     .find({
        //         userId: userId
        //     })
        //     .select('-userId -createdAt -updatedAt -__v')

        // const userDetails = {
        //     basicInfo: userBasicInfo,
        //     educations: userEducation,
        //     certifications: userCertifications,
        //     achievements: userAchievements
        // }

        // const preferences = {
        //     focus: 'Both educations and activities',
        //     locations: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan'],
        //     hostel: 'not necessary',
        //     maxBudget: '500000',
        //     examDetails: [
        //         {
        //             examName: 'JEE Mains',
        //             isTaken: false
        //         },
        //         {
        //             examName: 'JEE Advanced',
        //             isTaken: false
        //         },
        //         {
        //             examName: 'VITEEE',
        //             isTaken: true,
        //             rank: 20
        //         },
        //         {
        //             examName: 'BITSAT',
        //             isTaken: true,
        //             rank: 20
        //         }
        //     ]
        // }

        // const institutions = await institutionModel.aggregate([
        //     {
        //         $lookup: {
        //             from: 'courses',
        //             let: { institutionId: '$_id' },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: { $eq: ['$institutionId', '$$institutionId'] }
        //                     }
        //                 },
        //                 {
        //                     $match: { courseCategory: { $in: intrestCourse } }
        //                 }
        //             ],
        //             as: 'courses'
        //         }
        //     }
        // ])

        // const prompt = `
        // You are an expert college recommendation system. Based on the following user details, preferences, and available institutions, recommend the top 5 institutions that best fit the user.

        // Consider the following factors while recommending institutions:
        // - The user’s **educational background**, **skills**, **achievements**, and **certifications**.
        // - The user's **preferred focus** (academics, extracurricular activities, or both).
        // - The **budget constraint** (only recommend institutions within the budget).
        // - The **hostel requirement** (if true, prioritize institutions with hostel facilities).
        // - The **preferred locations** (recommend institutions only in these locations).
        // - The **user's interest in specific courses** (prioritize institutions offering these courses).
        // - The **user’s exam details**, including **exam names, scores, and ranks**, to evaluate the best fit.
        //    * For IIT look to JEE Advanced (if isTaken true then show only rank or score qualified institutions)
        //    * Fot NIT look for JEE Mains (if isTaken true then show only rank or score qualified institutions)
        //    * For VIT look for VITEEE (if isTaken true then show only rank or score qualified institutions)
        //    * For BITS look for BITS (if isTaken true then show only rank or score qualified institutions)
        //    * If all exam criteria fails then look for other institutions

        // **User Details:**
        // ${JSON.stringify(userDetails, null, 2)}

        // **Preferences:**
        // ${JSON.stringify(preferences, null, 2)}

        // **Institutions:**
        // ${JSON.stringify(institutions, null, 2)}

        // Return only a JSON array of the top 5 institution IDs in the following format:
        // ['institutionId1', 'institutionId2', 'institutionId3', 'institutionId4', 'institutionId5']
        // Do not include any additional text or explanation.
        // `

        // const chatGptResponse = await axios.post(
        //     'https://api.openai.com/v1/chat/completions',
        //     {
        //         model: 'gpt-3.5-turbo',
        //         messages: [{ role: 'system', content: prompt }],
        //         temperature: 0.7
        //     },
        //     {
        //         headers: {
        //             Authorization: `Bearer ${config.OPENAI_API_LINK}`,
        //             'Content-Type': 'application/json'
        //         }
        //     }
        // )

        // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        // const recommendedIds: string = chatGptResponse.data.choices[0].message.content

        // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // const parsedIds: string[] = typeof recommendedIds === 'string' ? JSON.parse(recommendedIds) : recommendedIds

        // const recommendations = await institutionModel.find({
        //     _id: { $in: parsedIds.map((id) => new mongoose.Types.ObjectId(id)) }
        // })

        const recommendations = [
            { institutionId: '67da7a19493705fc4fa01b5c', courseId: '67dcf0b200d67238261d1e97' },
            { institutionId: '67da7ac0493705fc4fa01b7d', courseId: '67dd4d4d00d67238261d1ea6' },
            { institutionId: '67da7b24493705fc4fa01b93', courseId: '67dd50ef00d67238261d1eb1' },
            { institutionId: '67da7c46493705fc4fa01bc1', courseId: '67dd567800d67238261d1ec5' },
            { institutionId: '67da9108493705fc4fa01d3f', courseId: '67de6781f7a9ff8d4fd73ff8' }
        ]

        const recommendationsDetails = []

        for (const recommend of recommendations) {
            const institution = await institutionModel.findById(recommend.institutionId).select('_id institutionName logo admission')
            const course = await courseModel
                .findById(recommend.courseId)
                .select('_id courseName category duration eligibility mode fees syllabus admissionProcess email phone website')

            const obj = {
                institutionDetail: {
                    id: institution?._id,
                    institutionName: institution?.institutionName,
                    logo: institution?.logo,
                    admission: institution?.admission,
                    course: {
                        id: course?._id,
                        courseName: course?.courseName,
                        category: course?.category,
                        duration: course?.duration,
                        eligibility: course?.eligibility,
                        mode: course?.mode,
                        fees: course?.fees,
                        syllabus: course?.syllabus,
                        admissionProcess: course?.admissionProcess,
                        email: course?.email,
                        phone: course?.phone,
                        website: course?.website
                    }
                }
            }

            recommendationsDetails.push(obj)
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                recommendations: recommendationsDetails
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

export const GetAllCourseCategory = async (): Promise<ApiMessage> => {
    try {
        const uniqueCategories = await courseCategoryModel.distinct('courseCategory')

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: uniqueCategories
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
