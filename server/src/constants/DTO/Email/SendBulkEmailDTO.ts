import { IsNotEmpty, IsString } from 'class-validator'

export class SendBulkEmailDTO {
    @IsNotEmpty({ message: 'Email addresses are required' })
    emailAddresses!: string[]

    @IsString({ message: 'Subject must be a string' })
    @IsNotEmpty({ message: 'Subject is required' })
    subject!: string

    @IsString({ message: 'Body must be a string' })
    @IsNotEmpty({ message: 'Body is required' })
    body!: string
}