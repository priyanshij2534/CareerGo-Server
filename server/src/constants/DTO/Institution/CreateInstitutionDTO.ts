import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { emailRegex, passwordRegex } from '../../regex'

export class CreateInstitutionDTO {
    @IsString({ message: 'Institution name must be a string' })
    @IsNotEmpty({ message: 'Institution name is required' })
    institutionName!: string

    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    adminName!: string

    @IsOptional()
    @IsString({ message: 'Logo must be a string' })
    logo?: string | null

    @IsOptional()
    @IsString({ message: 'Website url must be a string' })
    website?: string | null

    @IsString({ message: 'Registration number must be a string' })
    @IsNotEmpty({ message: 'Registration number address is required' })
    registrationNumber!: string

    @IsString({ message: 'Email address must be a string' })
    @IsNotEmpty({ message: 'Email address is required' })
    @Matches(emailRegex, { message: 'Invalid email address' })
    emailAddress!: string

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @Matches(passwordRegex, {
        message:
            'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character ( !, @, #, $, _ )'
    })
    password!: string

    @IsBoolean({ message: 'Consent must be a boolean' })
    conscent!: boolean
}
