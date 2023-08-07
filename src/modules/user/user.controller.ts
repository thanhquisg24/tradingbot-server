import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { omit } from 'lodash';
import { ROLE } from 'src/common/constants';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';
import { UserService } from './user.service';
import { RequestWithUser } from '../auth/type';
import { encryptWithAES } from 'src/common/utils/hash-util';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserChangePassPayload } from './dto/change-user-password.dto';
import { UserSettingPayload } from './dto/update-user.dto';

@Controller('api/v1/user')
@ApiTags('User APIs')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(ROLE.ADMIN)
  @Post('/create-user')
  async create(@Body() createUserDto: CreateUserDto) {
    const user: UserEntity & CreateUserDto = await this.userService.create(
      createUserDto,
    );
    return { id: user.id };
  }

  @Post('/create-admin')
  async createAdmin() {
    const createUserDto: CreateUserDto = {
      email: 'admin@app.bot',
      password: 'admin@!@3',
      refreshtoken: '',
      roles: [ROLE.ADMIN],
      telegramChatId: '812358696',
    };
    const user: UserEntity & CreateUserDto = await this.userService.create(
      createUserDto,
    );
    return { id: user.id };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/get-email-token')
  async getEmailToken(@Request() req: RequestWithUser) {
    const emailToken = encryptWithAES(req.user.email);
    return emailToken;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/change-user-password')
  async changeUserPassword(
    @Request() req: RequestWithUser,
    @Body() userChangePassPayload: UserChangePassPayload,
  ) {
    const result = await this.userService.changePass(
      req.user.id,
      userChangePassPayload,
    );
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/update-user-setting')
  async updateUserSetting(
    @Request() req: RequestWithUser,
    @Body() userSettingPayload: UserSettingPayload,
  ) {
    const result = await this.userService.updateUserSetting(
      req.user.id,
      userSettingPayload,
    );
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/get-user/:id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    const result = omit(user, ['password']);
    return result;
  }
}
