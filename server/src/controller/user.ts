import responseMessage from '../constants/responseMessage'
import userModel from '../model/user/userModel'
import { IDecryptedJwt } from '../types/userTypes'
import { ApiMessage } from '../utils/ApiMessage'
import { VerifyToken } from '../utils/helper/syncHelpers'
import config from '../config/config'

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
