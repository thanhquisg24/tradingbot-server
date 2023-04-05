import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PairService } from './pair.service';
import { CreatePairDto } from './dto/create-pair.dto';
import { UpdatePairDto } from './dto/update-pair.dto';

@Controller('pair')
export class PairController {
  constructor(private readonly pairService: PairService) {}

  @Post()
  create(@Body() createPairDto: CreatePairDto) {
    return this.pairService.create(createPairDto);
  }

  @Get()
  findAll() {
    return this.pairService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pairService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePairDto: UpdatePairDto) {
    return this.pairService.update(+id, updatePairDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pairService.remove(+id);
  }
}
