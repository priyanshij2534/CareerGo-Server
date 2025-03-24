import { EFocus } from '../../applicationEnums';
import { IsEnum, IsNumber, IsBoolean, IsArray, IsString, ArrayNotEmpty, IsOptional, Min } from 'class-validator';

class ExamDetails {
    examName!: string
    isTaken!: boolean
    score?: number
    rank?: number
}

export class RecommendationsDTO {
    @IsEnum(EFocus, { message: 'Consideration must be a valid enum value from EFocus' })
    consideration!: EFocus;

    @IsOptional()
    @IsNumber({}, { message: 'Budget must be a number' })
    @Min(0, { message: 'Budget must be a positive number' })
    budget?: number;

    @IsBoolean({ message: 'Hostel must be a boolean (true or false)' })
    hostel!: boolean;

    @IsArray({ message: 'Locations must be an array of strings' })
    @ArrayNotEmpty({ message: 'At least one location must be provided' })
    @IsString({ each: true, message: 'Each location must be a string' })
    locations!: string[];

    @IsArray({ message: 'InterestCourse must be an array of strings' })
    @ArrayNotEmpty({ message: 'At least one interest course must be provided' })
    @IsString({ each: true, message: 'Each interest course must be a string' })
    intrestCourse!: string[];

    examDetails?: ExamDetails[]
}
