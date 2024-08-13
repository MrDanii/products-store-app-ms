import { IsString, MinLength } from "class-validator";

export class TermDto {
  @IsString()
  @MinLength(1)
  term: string
}