import { PartialType } from '@nestjs/mapped-types';
import { CreatePairDto } from './create-pair.dto';

export class UpdatePairDto extends PartialType(CreatePairDto) {}
