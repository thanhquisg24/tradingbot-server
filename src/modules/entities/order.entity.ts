import { OrderSide, OrderStatus } from 'binance-api-node';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DealEntity } from './deal.entity';

export interface BuyOrder {
  sequence: number;
  deviation: number;
  volume: number;
  price: number;
  averagePrice: number;
  quantity: number;
  totalQuantity: number;
  totalVolume: number;
  exitPrice: number;
}

@Entity()
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number;

  @Column({ name: 'bot_id', type: 'int', nullable: true })
  botId: number;

  @Column({ name: 'exchange_id', type: 'int', nullable: true })
  exchangeId: number;

  // for buy order: 0 to max_no_of_safety_order
  // for sell order: 1000 + the correspondent buy order
  @Column({ type: 'int' })
  sequence: number;

  @Column({
    name: 'deviation',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  deviation: string;

  // BUY or SELL
  @Column({ length: 4 })
  side: OrderSide;

  @Column({ length: 32 })
  price: string;

  @Column({
    name: 'filled_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  filledPrice: string;

  @Column({
    name: 'average_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  averagePrice: string;

  @Column({
    name: 'exit_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  exitPrice: string;

  @Column({ length: 255, nullable: true })
  binanceOrderId: string;

  @Column({
    name: 'quantity',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  quantity: string;

  @Column({
    name: 'volume',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  volume: string;

  @Column({
    name: 'total_quantity',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  totalQuantity: string;

  @Column({ length: 16 })
  status: 'CREATED' | OrderStatus;

  @ManyToOne(() => DealEntity)
  @JoinColumn({ name: 'deal_id', referencedColumnName: 'id' })
  deal: DealEntity;
}
