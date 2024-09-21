import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from "class-validator"

export class GoogleAuthDto {
  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(1)
  firstName: string
  
  @IsString()
  lastName: string
  
  @IsOptional()
  @IsString()
  @MinLength(1)
  picture: string
  
  @IsOptional()
  @IsString()
  @MinLength(1)
  accessToken: string
}