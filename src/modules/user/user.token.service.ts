import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { STATUS } from 'src/common/constants';
import { UserClaimTokenException } from 'src/common/exceptions/ClaimUserToken.exception';
import { Repository } from 'typeorm';
import { UpdateVesingHistoryDto } from '../vesing-history/dto/update-vesing-history.dto';
import { VesingHistoryService } from '../vesing-history/vesing-history.service';
import { VestingAddressService } from '../vesting-address/vesting-address.service';
import { ClaimUserTokenDto } from './dto/claim-user-token-dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserTokenService {
  private readonly logger = new Logger(UserTokenService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly vestingAddressService: VestingAddressService,
    private readonly vesingHistoryService: VesingHistoryService,
  ) {}

  async claimToken(claimDto: ClaimUserTokenDto): Promise<string> {
    const currentUser = await this.repo.findOneBy({ id: claimDto.userId });
    const amtTotransfer = Number(currentUser.avaiable);
    if (!currentUser) {
      throw new BadRequestException('This User is not exist!');
    }
    if (currentUser.avaiable <= 0) {
      throw new UserClaimTokenException('No Token amount available!');
    }

    const fromVestTrans =
      await this.vestingAddressService.findOneByUserIdAndDecode(currentUser.id);

    const fromVestBalance = Number(fromVestTrans.balance);
    if (amtTotransfer > fromVestBalance) {
      throw new UserClaimTokenException('Not enough token to transfer!');
    }
    this.logger.log('claimToken() check balance OK');

    this.logger.log('claimToken() save prepareHistoryRow');
    //1.save prepareVestingHistoryRow

    this.logger.log('claimToken()  update avaiable token of user');
    //2. update avaiable token and claimed of user and vestingAddress table
    await this.repo.update(currentUser.id, {
      avaiable: Number(currentUser.avaiable) - amtTotransfer,
      claimed: Number(currentUser.claimed) + amtTotransfer,
    });
    this.logger.log('claimToken()  update balance of vestingAddress table');
    await this.vestingAddressService.update(fromVestTrans.id, {
      id: fromVestTrans.id,
      balance: Number(fromVestTrans.balance) - amtTotransfer,
    });

    this.logger.log('claimToken() send TX postTxClaim()');
    //2.send TX
    return 'ok';
  }
  async storeSettledClaimToken(
    prepareHistoryRow: UpdateVesingHistoryDto,
    postTx: string,
  ): Promise<string> {
    const postHistoryRow: UpdateVesingHistoryDto = {
      id: prepareHistoryRow.id,
      txId: postTx,
      status: STATUS.SETTLED,
    };
    this.logger.log('claimToken() save postVestingHistoryRow');
    //3.save postVestingHistoryRow
    await this.vesingHistoryService.update(postHistoryRow.id, postHistoryRow);
    // await Promise.all([up1, up2, up3]);
    return postTx;
  }
}
