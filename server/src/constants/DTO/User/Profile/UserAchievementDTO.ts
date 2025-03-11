import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { EAchievementType } from '../../../applicationEnums'

export class UserAchievementDTO {
    @IsNotEmpty({ message: 'Title is required' })
    @IsString({ message: 'Title must be a string' })
    title!: string

    @IsNotEmpty({ message: 'Achievement type is required' })
    @IsEnum(EAchievementType, { message: 'Type must be a valid EAchievementType value' })
    type!: EAchievementType

    @IsNotEmpty({ message: 'Awarded by is required' })
    @IsString({ message: 'Awarded by must be a string' })
    awardedBy!: string

    @IsNotEmpty({ message: 'Start date is required' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Start date must be in YYYY-MM-DD format' })
    startDate!: string

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'End date must be in YYYY-MM-DD format' })
    endDate?: string

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    description?: string
}
