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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { omit } from 'lodash';
import { GenInitUserDto } from './dto/gen-init-user.dto';
import { ClaimUserTokenDto } from './dto/claim-user-token-dto';
import { UserClaimTokenException } from 'src/common/exceptions/ClaimUserToken.exception';
import { UserTokenService } from './user.token.service';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ROLE } from 'src/common/constants';

@Controller('api/v1/user')
@ApiTags('User APIs')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userTokenService: UserTokenService,
  ) {}

  @ApiBearerAuth()
  // @HasRoles(ROLE.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user: UserEntity & CreateUserDto = await this.userService.create(
      createUserDto,
    );
    return { id: user.id };
  }

  @ApiBearerAuth()
  // @HasRoles(ROLE.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create-admin')
  async createAdmin() {
    const createUserDto: CreateUserDto = {
      email: 'admin@numblock.org',
      password: 'admin@!@3',
      price: 1,
      totalAmount: 0,
      locked: 0,
      avaiable: 0,
      claimed: 0,
      startDate: new Date(),
      endDate: new Date(),
      vestingLogic: '10|10d|20M',
      refreshtoken: '',
      roles: [ROLE.ADMIN],
    };
    const user: UserEntity & CreateUserDto = await this.userService.create(
      createUserDto,
    );
    return { id: user.id };
  }

  @ApiBearerAuth()
  @Post('create-and-gen-schedule')
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async genInit(@Body() initDto: GenInitUserDto) {
    const user: UserEntity & GenInitUserDto =
      await this.userService.createAndGenSchedule(initDto);
    return { id: user.id };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('claim-token')
  async claimToken(@Body() claimDto: ClaimUserTokenDto, @Request() request) {
    const currentUserId = request.user['id'];
    if (currentUserId !== claimDto.userId) {
      throw new UserClaimTokenException('Current user is not valid!');
    }
    const tx: string = await this.userTokenService.claimToken(claimDto);
    return { tx };
    // return { tx: 'aaaaa' };
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    const result = omit(user, ['password']);
    return result;
  }

  // @UseGuards(JwtAuthGuard)
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }
  // @UseGuards(JwtAuthGuard)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
