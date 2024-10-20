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
    answer_id!: Date;

    @IsNotEmpty()
    endTime!: Date;
}
