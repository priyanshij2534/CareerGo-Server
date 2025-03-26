import { IsDateString, IsNotEmpty, IsString } from 'class-validator'

export class RescheduleCounsellingDTO {
    @IsDateString({}, { message: 'Date must be a valid ISO date string' })
    @IsNotEmpty({ message: 'New Date is required.' })
    newDate!: string

    @IsString({ message: 'New Time must be a valid string.' })
    @IsNotEmpty({ message: 'New Time is required.' })
    newTime!: string
}
