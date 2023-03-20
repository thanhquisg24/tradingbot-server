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
import { VesingHistoryService } from './vesing-history.service';
import { CreateVesingHistoryDto } from './dto/create-vesing-history.dto';
import { UpdateVesingHistoryDto } from './dto/update-vesing-history.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { ROLE } from 'src/common/constants';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('api/v1/vesing-history')
@ApiTags('Vesting history APIs')
export class VesingHistoryController {
  constructor(private readonly vesingHistoryService: VesingHistoryService) {}

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createVesingHistoryDto: CreateVesingHistoryDto) {
    return this.vesingHistoryService.create(createVesingHistoryDto);
  }

  @Get()
  findAll() {
    return this.vesingHistoryService.findAll();
  }

  @Get('byUserId/:userId')
  findByUserId(@Param('userId') userId: number) {
    return this.vesingHistoryService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vesingHistoryService.findOne(+id);
  }

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVesingHistoryDto: UpdateVesingHistoryDto,
  ) {
    return this.vesingHistoryService.update(+id, updateVesingHistoryDto);
  }

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vesingHistoryService.remove(+id);
  }
}
