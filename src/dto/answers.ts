import { IsNotEmpty } from "class-validator";

export class AnswersDto {
    
    @IsNotEmpty()
    question_id!: string;

    @IsNotEmpty()
    result_id!: string;

    @IsNotEmpty()
    score!: number;

    @IsNotEmpty()
    answer!: string;

    @IsNotEmpty()
    startTime!: Date;

    @IsNotEmpty()
    endTime!: Date;
}
