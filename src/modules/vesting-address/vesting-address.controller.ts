import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VestingAddressService } from './vesting-address.service';
import { CreateVestingAddressDto } from './dto/create-vesting-address.dto';
import { UpdateVestingAddressDto } from './dto/update-vesting-address.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { ROLE } from 'src/common/constants';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('api/v1/vesing-address')
@ApiTags('Vesting address APIs')
export class VestingAddressController {
  constructor(private readonly vestingAddressService: VestingAddressService) {}

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createVestingAddressDto: CreateVestingAddressDto) {
    return this.vestingAddressService.create(createVestingAddressDto);
  }

  @Get()
  findAll() {
    return this.vestingAddressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vestingAddressService.findOne(+id);
  }

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVestingAddressDto: UpdateVestingAddressDto,
  ) {
    return this.vestingAddressService.update(+id, updateVestingAddressDto);
  }

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vestingAddressService.remove(+id);
  }
}
