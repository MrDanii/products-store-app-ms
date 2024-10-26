import { ArrayMinSize, IsArray, IsBoolean, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from "class-validator"

export class UpdateUserDto {
  @IsUUID()
  idUser: string

  @IsOptional()
  @IsString()
  userNickName?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  // @IsOptional()
  // @IsArray()
  // @ArrayMinSize(1)
  // roles?: string[] = ['user']

  @IsOptional()
  @IsString()
  updatedBy?: string
}