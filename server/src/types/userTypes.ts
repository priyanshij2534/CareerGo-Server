import { Request } from 'express'
import { EUserRole } from '../constants/applicationEnums'
import { JwtPayload } from 'jsonwebtoken'
import mongoose from 'mongoose'

export interface IUser {
    name: string
    emailAddress: string
    password: string
    role: EUserRole
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
