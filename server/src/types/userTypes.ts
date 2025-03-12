import { Request } from 'express'
import { EAchievementType, ELanguageExperties, ESocialPlatform, EUserRole } from '../constants/applicationEnums'
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
}
