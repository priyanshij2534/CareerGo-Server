import { IsNotEmpty, IsString, Matches } from 'class-validator'
import { emailRegex } from '../../regex'

export class SendEmailDTO {
    @IsString({ message: 'Email address must be a string' })
    @IsNotEmpty({ message: 'Email address is required' })
    @Matches(emailRegex, { message: 'Invalid email address' })
    emailAddress!: string

    @IsString({ message: 'Subject must be a string' })
    @IsNotEmpty({ message: 'Subject is required' })
    subject!: string

    @IsString({ message: 'Body must be a string' })
    @IsNotEmpty({ message: 'Body is required' })
    body!: string
}
