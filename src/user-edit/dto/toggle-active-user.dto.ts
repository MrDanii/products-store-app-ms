import { IsString, IsUUID, MinLength } from "class-validator"

export class ToggleActiveUserDto {
  @IsUUID()
  idUserToToggle: string

  @IsString()
  @MinLength(1)
  userWhoUpdated: string
}