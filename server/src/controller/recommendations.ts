import institutionModel from '../model/Institution/institutionModel'
import config from '../config/config'
import axios from 'axios'
import responseMessage from '../constants/responseMessage'
import userModel from '../model/user/userModel'
import { ApiMessage } from '../utils/ApiMessage'
import courseCategoryModel from '../model/Institution/courseCategoryModel'
import courseModel from '../model/Institution/courseModel'
import { RecommendationsDTO } from '../constants/DTO/Recommendations/RecommendationsDTO'
import { EDegreeCategory, EEducationLevel, EExam } from '../constants/applicationEnums'
import userAchievementModel from '../model/user/Profile/userAchievementModel'
import userCertificationModel from '../model/user/Profile/userCertificationModel'
import userEducationModel from '../model/user/Profile/userEducationModel'

export const GetRecommendations = async (userId: string, input: RecommendationsDTO): Promise<ApiMessage> => {
    const { educationLevel, degreeCategory, budget, examDetails, hostel } = input
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

        const userEducation = await userEducationModel
            .find({
                userId: userId
            })
            .select('-userId -createdAt -updatedAt -__v')

        const userAchievements = await userAchievementModel
            .find({
                userId: userId
            })
            .select('-userId -createdAt -updatedAt -__v')

        const userCertifications = await userCertificationModel
            .find({
                userId: userId
            })
            .select('-userId -createdAt -updatedAt -__v')

        const userDetails = {
            educations: userEducation,
            certifications: userCertifications,
            achievements: userAchievements
        }

        const courseCategoryList = []

        if (educationLevel === EEducationLevel.UG) {
            switch (degreeCategory) {
                case EDegreeCategory.ENGINEERING_TECHNOLOGY:
                    courseCategoryList.push('B.Tech', 'B.Tech + M.Tech', 'BE', 'BS', 'BS + MS')
                    break
                case EDegreeCategory.MANAGEMENT_BUSINESS:
                    courseCategoryList.push('BBA', 'BMS')
                    break
                case EDegreeCategory.MEDICAL_PHARMACY:
                    courseCategoryList.push('MBBS', 'BDS', 'B.Pharm', 'BPT', 'BHMS', 'BAMS')
                    break
                case EDegreeCategory.SCIENCE_RESEARCH:
                    courseCategoryList.push('B.Sc', 'B.S')
                    break
                case EDegreeCategory.ARCHITECTURE_DESIGN:
                    courseCategoryList.push('B.Arch', 'B.Des')
                    break
                default:
                    courseCategoryList.push('BA', 'BCA', 'B.Ed')
            }
        } else if (educationLevel === EEducationLevel.PG) {
            switch (degreeCategory) {
                case EDegreeCategory.ENGINEERING_TECHNOLOGY:
                    courseCategoryList.push('M.Tech', 'ME', 'M.S')
                    break
                case EDegreeCategory.MANAGEMENT_BUSINESS:
                    courseCategoryList.push('MBA', 'Integrated MBA', 'MPP')
                    break
                case EDegreeCategory.MEDICAL_PHARMACY:
                    courseCategoryList.push('M.Pharm', 'MD', 'MDS')
                    break
                case EDegreeCategory.SCIENCE_RESEARCH:
                    courseCategoryList.push('M.Sc', 'M.S', 'Ph.D')
                    break
                case EDegreeCategory.ARCHITECTURE_DESIGN:
                    courseCategoryList.push('M.Arch', 'M.Des')
                    break
                default:
                    courseCategoryList.push('M.A', 'L.L.M', 'MCA', 'Polytechnic')
            }
        }

        const categoryFilter = { category: { $in: courseCategoryList } }
        const budgetFilter = budget ? { fees: { $lte: budget } } : {}

        const courses = await courseModel.aggregate([
            { $match: { ...categoryFilter, ...budgetFilter } },
            {
                $lookup: {
                    from: 'institutions',
                    localField: 'institutionId',
                    foreignField: '_id',
                    as: 'institution'
                }
            },
            { $unwind: '$institution' },
            { $match: hostel !== undefined ? { 'institution.hostel': hostel } : {} },
            {
                $project: {
                    courseId: '$_id',
                    courseName: 1,
                    category: 1,
                    duration: 1,
                    eligibility: 1,
                    mode: 1,
                    fees: 1,
                    institutionId: '$institution._id',
                    institutionName: '$institution.institutionName',
                    hostel: '$institution.hostel'
                }
            }
        ])

        const examDetailList: { examName: EExam; isTaken: boolean; rank?: number }[] = []

        if (examDetails) {
            examDetails.map((examDetail) => {
                let obj
                if (examDetail.isTaken) {
                    obj = {
                        examName: examDetail.examName,
                        isTaken: examDetail.isTaken,
                        rank: examDetail.rank
                    }
                } else {
                    obj = {
                        examName: examDetail.examName,
                        isTaken: examDetail.isTaken
                    }
                }
                examDetailList.push(obj)
            })
        }

        const prompt = `
        You are an expert AI-powered college recommendation system. Based on the user’s academic profile, achievements, certifications, exam results, and preferences, your goal is to recommend the **best 5 best-fit institutions** from the given list.
        ### **Evaluation Criteria:**
        1. **Exam Performance & Eligibility:**
        - Prioritize institutions based on relevant entrance exam performance.
        - Ensure that the user meets the eligibility criteria before considering an institution.
        - **Match exams with institutions:**
            - **IITs → JEE Advanced** (if isTaken is true, prioritize institutions where the user meets rank/score criteria).
            - **NITs → JEE Mains**
            - **VIT → VITEEE**
            - **BITS → BITSAT**
            - **Other institutions → Consider alternative eligibility criteria**

        2. **Educational Background, Certifications & Achievements:**
        - Favor institutions aligned with the user's education, skills, and accomplishments.
        - If the user has domain-specific certifications or achievements, prioritize institutions that recognize them.

        3. **Ranking & Selection:**
        - First, filter institutions based on **exam eligibility** and **budget**.
        - Then, rank them based on **education, certifications, achievements, and user preferences**.
        - Finally, return **only the best 5 institutions** in JSON format.

        ### **User Profile:**
        ${JSON.stringify(userDetails, null, 2)}

        ### **Available Institutions:**
        ${JSON.stringify(courses, null, 2)}

        ### **Output Format:**
        Return only a JSON array of the best 5 institution IDs in the following format:
        [
           {'institutionId1', 'courseId1'},
           {'institutionId2', 'courseId2'},
           {'institutionId3', 'courseId3'},
           {'institutionId4', 'courseId4'},
           {'institutionId5', 'courseId5'},
        ]
        Use courseId for courseIds and institutionId for institutionIds and ignore _id
        Do not include any additional text or explanation.
        `

        const chatGptResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'system', content: prompt }],
                temperature: 0.7
            },
            {
                headers: {
                    Authorization: `Bearer ${config.OPENAI_API_LINK}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const recommendedIds: string = chatGptResponse.data.choices[0].message.content

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsedIds: { institutionId: string; courseId: string }[] = JSON.parse(recommendedIds)

        if (!Array.isArray(parsedIds) || parsedIds.some((item) => typeof item !== 'object')) {
            throw new Error('Invalid format received from model response')
        }

        const recommendations = parsedIds.map((item) => {
            const institutionIdKey = Object.keys(item).find((key) => key.startsWith('institutionId'))
            const courseIdKey = Object.keys(item).find((key) => key.startsWith('courseId'))

            if (!institutionIdKey || !courseIdKey) {
                throw new Error('Invalid response format')
            }

            return {
                institutionId: item[institutionIdKey as 'institutionId'],
                courseId: item[courseIdKey as 'courseId']
            }
        })

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
