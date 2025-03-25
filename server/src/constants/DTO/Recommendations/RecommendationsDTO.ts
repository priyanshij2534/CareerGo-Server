import { EConsideration, EDegreeCategory, EEducationLevel, EExam } from '../../applicationEnums'
import { IsEnum, IsNumber, IsBoolean, IsArray, IsString, ArrayNotEmpty, IsOptional, Min } from 'class-validator'

class ExamDetails {
    @IsEnum(EExam, { message: 'Exam name must be a valid enum value from EExam' })
    examName!: EExam

    @IsBoolean({ message: 'isTaken must be a boolean' })
    isTaken!: boolean

    @IsOptional()
    @IsNumber({}, { message: 'Rank must be a number' })
    @Min(1, { message: 'Rank must be at least 1' })
    rank?: number
}

export class RecommendationsDTO {
    @IsArray({ message: 'Locations must be an array of strings' })
    @ArrayNotEmpty({ message: 'At least one location must be provided' })
    @IsString({ each: true, message: 'Each location must be a string' })
    locations!: string[]

    @IsEnum(EEducationLevel, { message: 'Education level must be a valid enum value from EEducationLevel' })
    educationLevel!: EEducationLevel
    
    @IsEnum(EDegreeCategory, { message: 'Degree Category must be a valid enum value from EDegreeCategory' })
    degreeCategory!: EDegreeCategory

    @IsEnum(EConsideration, { message: 'Consideration must be a valid enum value from EConsideration' })
    consideration!: EConsideration

    @IsOptional()
    @IsNumber({}, { message: 'Budget must be a number' })
    @Min(0, { message: 'Budget must be a positive number' })
    budget?: number

    @IsBoolean({ message: 'Hostel must be a boolean (true or false)' })
    hostel!: boolean

    examDetails?: ExamDetails[]
}
