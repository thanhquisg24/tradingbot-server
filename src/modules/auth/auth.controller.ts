import { Controller, Logger, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh-auth.guard';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/RefreshTokenDto';
import { UserLoginDto } from './dto/UserLoginDto';
import { RequestWithUser } from './type';

@Controller('api/v1/auth')
@ApiTags('Auth APIs')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  private logger = new Logger(AuthController.name);
  //handle login

  @ApiBody({ type: UserLoginDto })
  @ApiOkResponse({ description: 'result Token' })
  @ApiBadRequestResponse({
    description: 'Invalid parameter',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() request): Promise<any> {
    return this.authService.login(request.user);
  }

  @ApiBearerAuth()
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'refresh Token' })
  @ApiBadRequestResponse({
    description: 'Invalid parameter',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-token')
  async refreshToken(@Request() req: RequestWithUser) {
    return await this.authService.login(req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  logout(@Request() req: RequestWithUser) {
    this.authService.logout(req.user['id']);
    return 'ok';
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/check_token')
  checkToken() {
    return 'ok';
  }

  // @Post('/register')
  // async registerUser(@Body() input: CreateUserDto) {
  //   const check = await this.validate(input.email);
  //   if (!check) {
  //     throw new HttpException(
  //       { message: 'User already exists' },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   input.password = await this.authService.hashPassword(input.password);
  //   return this.userService.create(input);
  // }

  // @Post('/login')
  // async handleLogin(@Body() input) {
  //   console.log(input, 99999);
  //   const user = await this.userService.getUserByEmail(input.email);
  //   console.log(user);
  // }

  // async validate(email: string) {
  //   try {
  //     const users = await this.userService.geUsersByEmail(email);
  //     return users.length <= 0;
  //   } catch (e) {
  //     return false;
  //   }
  // }
}
