import { Module } from '@nestjs/common';
import { UserEditService } from './user-edit.service';
import { UserEditController } from './user-edit.controller';

@Module({
  controllers: [UserEditController],
  providers: [UserEditService],
  exports: [UserEditService]
})
export class UserEditModule {}
