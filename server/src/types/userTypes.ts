import { Request } from 'express'
import { EAchievementType, EEducationCategory, EGradeType, ELanguageExperties, ESocialPlatform, EUserRole } from '../constants/applicationEnums'
import { JwtPayload } from 'jsonwebtoken'
import mongoose from 'mongoose'

export interface IUser {
    name: string
    emailAddress: string
    password: string
    role: EUserRole
    profileImage: string | null
    accountConfirmation: {
        status: boolean
        token: string
        code: string
        timestamp: Date | null
    }
    institution: {
        isAssociated: boolean
        institutionId: mongoose.Schema.Types.ObjectId | null
    }
    passwordReset: {
        token: string | null
        expiry: number | null
        lastResetAt: Date | null
    }
    userProfileProgress: number 
    lastLoginAt: Date | null
    consent: boolean
}

export interface IInstitution {
    institutionName: string
    emailAddress: string
    logo: string | null
    website: string | null
    registrationNumber: string | null
    adminId: mongoose.Schema.Types.ObjectId
    consent: boolean
    admission: boolean | null 
    hostel: boolean | null 
}

export interface IUserBasicInfo {
    userId: mongoose.Schema.Types.ObjectId
    phone: string | null
    dateOfBirth: Date | null
    gender: string | null
    region: string | null
    languages: {
        name: string
        read: ELanguageExperties
        write: ELanguageExperties
    }[]
    skills: string[]
    socialLinks: {
        platform: ESocialPlatform
        url: string
    }[]
}

export interface IUserAchievement {
    userId: mongoose.Schema.Types.ObjectId
    title: string
    type: EAchievementType
    awardedBy: string
    startDate: string
    endDate: string | null
    description: string | null
}

export interface IUserCertification {
    userId: mongoose.Schema.Types.ObjectId
    title: string
    issuedBy: string
    startDate: string
    endDate: string | null
    expiryDate: string | null
}

export interface IUserEducation {
    userId: mongoose.Schema.Types.ObjectId
    institutionName: string
    category: EEducationCategory
    grade: {
        type: EGradeType
        value: number
    }
    startDate: string 
    endDate: string | null
    
    // 10th and 12th only
    standard: string | null
    board: string | null
    mediumOfInstruction: string | null 

    // College only
    stream: string | null
    major: string | null
    specialization: string | null
}

export interface IRefreshToken {
    token: string
}

export interface IAuthenticatedRequest extends Request {
    authenticatedUser: IUser
}

export interface IDecryptedJwt extends JwtPayload {
    userId: string
    role: string
    name: string
    institutionId: string
}
