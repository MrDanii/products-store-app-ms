import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @IsString()
  email: string

  @IsString()
  @MinLength(4)
  userNickName: string

  @IsString()
  // @IsStrongPassword()
  @MinLength(6)
  password: string

  @IsString()
  fullName: string
}