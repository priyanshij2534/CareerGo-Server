import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ApprovalDTO {
    @IsBoolean({ message: 'Purpose must be a either true or false' })
    @IsNotEmpty({ message: 'Purpose is required' })
    approval!: boolean

    @IsString({ message: 'Purpose must be a string' })
    @IsOptional()
    disapprovalReason?: string
}
