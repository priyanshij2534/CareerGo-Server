import { IsString, IsNumber, IsEmail, IsArray, IsEnum, IsOptional } from 'class-validator'
import { ECourseMode } from '../../../constants/applicationEnums'

export class CourseDTO {
    @IsString({ message: 'Course name must be a string' })
    courseName!: string

    @IsString({ message: 'Category must be a string' })
    category!: string

    @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Duration must be a number' })
    duration!: number

    @IsString({ message: 'Eligibility must be a string' })
    eligibility!: string

    @IsEnum(ECourseMode, { message: 'Mode must be a valid course mode' })
    mode!: ECourseMode

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Fees must be a number' })
    fees!: number

    @IsArray({ message: 'Syllabus must be an array of strings' })
    @IsString({ each: true, message: 'Each syllabus item must be a string' })
    syllabus!: string[]

    @IsString({ message: 'Admission process must be a string' })
    admissionProcess!: string

    @IsEmail({}, { message: 'Email must be a valid email address' })
    email!: string

    @IsString({ message: 'Phone number must be a string' })
    phone!: string

    @IsString({ message: 'Website must be a string' })
    website!: string

    @IsOptional()
    @IsString({ message: 'Brochure must be a string' })
    brochure?: string
}
