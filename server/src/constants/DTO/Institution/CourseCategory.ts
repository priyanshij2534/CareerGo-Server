import { IsOptional, IsString } from 'class-validator'

export class CourseCategoryDTO {
    @IsOptional()
    @IsString({ message: 'Course category must be a string' })
    courseCategory!: string
}
