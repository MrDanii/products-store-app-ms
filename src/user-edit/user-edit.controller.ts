import { Controller } from '@nestjs/common';
import { UserEditService } from './user-edit.service';
import { ToggleActiveUserDto, UpdateUserAdminDto, UpdateUserDto, UserPaginationDto } from './dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class UserEditController {
  constructor(private readonly userEditService: UserEditService) {}

  @MessagePattern('user.find.all')
  findAllUsers(@Payload() userPaginationDto: UserPaginationDto) {
    return this.userEditService.findAllUsers(userPaginationDto)
  }

  @MessagePattern('user.find.one')
  findUser(@Payload() idUser: string) {
    return this.userEditService.findUser(idUser)
  }

  @MessagePattern('user.update.self')
  updateSelfUserInfo(@Payload() updateUserDto: UpdateUserDto) {
    return this.userEditService.updateSelfUserInfo(updateUserDto)
  }

  @MessagePattern('user.update.one')
  updateUserFromAdmin(@Payload() updateUserAdminDto: UpdateUserAdminDto) {
    return this.userEditService.updateUserFromAdmin(updateUserAdminDto)
  }

  @MessagePattern('user.toggle.active')
  toggleActiveUser(@Payload() toggleActiveUserDto: ToggleActiveUserDto) {
    return this.userEditService.toggleActiveUser(toggleActiveUserDto)
  }
}
