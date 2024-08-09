import { Controller, Req, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateUserDto, GoogleAuthDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @MessagePattern('auth.check1')
  authCheckHealth() {
    return {
      ok: true,
      message: 'Auth Services Health Check'
    }
  }

  @MessagePattern('auth.register.user')
  createUser(@Payload() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
    // return createUserDto
  }

  @MessagePattern('auth.login.user')
  loginUser(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto)
  }

  @MessagePattern('auth.verify.token')
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token)
  }

  @MessagePattern('auth.google.redirect')
  googleAuthRedirect(@Payload() googleAuthDto: GoogleAuthDto) {
    // console.log(googleAuthDto);
    return this.authService.googleLoginUser(googleAuthDto)
  }

}
