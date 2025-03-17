import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateInstitutionDetailsDTO {
    @IsOptional()
    @IsString({ message: 'Website url must be a string' })
    website?: string | null

    @IsOptional()
    @IsBoolean({ message: 'Admission must be a valid boolean' })
    admission!: boolean
}
