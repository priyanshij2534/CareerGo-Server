import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, MaxLength, Min, Max, IsDateString } from 'class-validator'
import { EEducationCategory, EGradeType } from '../../../applicationEnums'

export class GradeDTO {
    @IsNotEmpty({ message: 'Grade type is required' })
    @IsEnum(EGradeType, { message: 'Grade type must be a valid enum value' })
    type!: EGradeType

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Grade must be a number (2 decimal places allowed)' })
    @Min(0, { message: 'Grade must be at least 0' })
    @Max(100, { message: 'Grade cannot exceed 100' })
    @IsNotEmpty({ message: 'Grade value is required' })
    value!: number
}

export class UserEducationDTO {
    @IsNotEmpty({ message: 'Institution name is required' })
    @IsString({ message: 'Institution name must be a string' })
    @MaxLength(255, { message: 'Institution name cannot exceed 255 characters' })
    institutionName!: string

    @IsNotEmpty({ message: 'Education category type is required' })
    @IsEnum(EEducationCategory, { message: 'Education category type must be a valid enum value' })
    category!: EEducationCategory

    @IsNotEmpty({ message: 'Grade information is required' })
    grade!: GradeDTO

    @IsNotEmpty({ message: 'Start date is required' })
    @IsDateString({}, { message: 'Start date must be a valid date string' })
    startDate!: string

    @IsOptional()
    @IsDateString({}, { message: 'End date must be a valid date string' })
    endDate!: string | null

    @IsOptional()
    @IsString({ message: 'Standard must be a string' })
    standard?: string

    @IsOptional()
    @IsString({ message: 'Board must be a string' })
    board?: string

    @IsOptional()
    @IsString({ message: 'Medium of instruction must be a string' })
    mediumOfInstruction?: string

    @IsOptional()
    @IsString({ message: 'Stream must be a string' })
    stream?: string

    @IsOptional()
    @IsString({ message: 'Major must be a string' })
    major?: string

    @IsOptional()
    @IsString({ message: 'Specialization must be a string' })
    specialization?: string
}
