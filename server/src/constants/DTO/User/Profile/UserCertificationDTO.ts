import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class UserCertificationDTO {
    @IsNotEmpty({ message: 'Title is required' })
    @IsString({ message: 'Title must be a string' })
    title!: string

    @IsNotEmpty({ message: 'Awarded by is required' })
    @IsString({ message: 'Awarded by must be a string' })
    issuedBy!: string

    @IsNotEmpty({ message: 'Start date is required' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Start date must be in YYYY-MM-DD format' })
    startDate!: string

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'End date must be in YYYY-MM-DD format' })
    endDate?: string

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Expiry date must be in YYYY-MM-DD format' })
    expiryDate?: string
}
