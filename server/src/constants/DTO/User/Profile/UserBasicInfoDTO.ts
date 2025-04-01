import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested, IsArray } from 'class-validator'
import { ELanguageExperties, ESocialPlatform } from '../../../applicationEnums'

export class SocialLinksDTO {
    @IsNotEmpty({ message: 'Platform is required' })
    @IsEnum(ESocialPlatform, { message: 'Platform must be a valid enum value' })
    platform!: ESocialPlatform

    @IsString({ message: 'URL must be a string' })
    @IsNotEmpty({ message: 'URL is required' })
    url!: string
}

export class LanguagesDTO {
    @IsString({ message: 'Language name must be a valid string' })
    @IsNotEmpty({ message: 'Language name is required' })
    name!: string

    @IsNotEmpty({ message: 'Read proficiency is required' })
    @IsEnum(ELanguageExperties, { message: 'Read proficiency must be a valid enum value' })
    read!: ELanguageExperties

    @IsNotEmpty({ message: 'Write proficiency is required' })
    @IsEnum(ELanguageExperties, { message: 'Write proficiency must be a valid enum value' })
    write!: ELanguageExperties
}

export class UserBasicInfoDTO {
    @IsOptional()
    @IsString({ message: 'Phone number must be a valid string' })
    phone?: string

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be in YYYY-MM-DD format' })
    dateOfBirth?: string

    @IsOptional()
    @IsEnum(['Male', 'Female', 'Other'], { message: 'Gender must be Male, Female, or Other' })
    gender?: string

    @IsOptional()
    @IsString({ message: 'Region must be a string' })
    @IsNotEmpty({ message: 'Region cannot be empty' })
    region?: string

    @IsOptional()
    @IsArray({ message: 'Languages must be an array' })
    @ValidateNested({ each: true })
    languages?: LanguagesDTO[]

    @IsOptional()
    @IsArray({ message: 'Skills must be an array' })
    @IsString({ each: true, message: 'Each skill must be a string' })
    skills?: string[]

    @IsOptional()
    @ValidateNested()
    socialLinks?: SocialLinksDTO[]
}
