import { IsString } from 'class-validator'

export class CourseCategoryDTO {
    @IsString({ message: 'Course category must be a string' })
    courseCategory!: string
}
