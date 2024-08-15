import { ArrayMinSize, IsArray, IsEmail, IsString, IsUUID, MinLength } from "class-validator"

export class UserJwtDto {
  @IsUUID()
  id?: string

  @IsEmail()
  email?: string

  @IsString()
  @MinLength(1)
  userNickName?: string

  @IsString()
  @MinLength(1)
  fullName?: string

  @IsArray()
  // @ArrayMinSize(1)
  roles?: string[]
}