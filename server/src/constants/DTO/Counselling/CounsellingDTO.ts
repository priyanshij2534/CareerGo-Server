import { IsDateString, IsNotEmpty, IsString } from 'class-validator'

export class CounsellingDTO {
    @IsString({ message: 'Invalid institution ID' })
    @IsNotEmpty({ message: 'Institution ID is required' })
    institutionId!: string

    @IsDateString({}, { message: 'Date must be a valid ISO date string' })
    @IsNotEmpty({ message: 'Date is required' })
    date!: string

    @IsString({ message: 'Time must be a string' })
    @IsNotEmpty({ message: 'Time is required' })
    time!: string

    @IsString({ message: 'Purpose must be a string' })
    @IsNotEmpty({ message: 'Purpose is required' })
    purpose!: string
}
