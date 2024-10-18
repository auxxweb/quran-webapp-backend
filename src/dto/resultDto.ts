import { IsNotEmpty, IsEmail } from "class-validator";

export class ResultDto {
    
    @IsNotEmpty()
    participant_id!: string;

    @IsNotEmpty()
    startTime!: Date;

    @IsNotEmpty()
    endTime!: Date;
}
