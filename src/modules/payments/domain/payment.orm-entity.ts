import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity('payments')
export class PaymentOrmEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  merchantId!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.ACCEPTED,
  })
  status!: PaymentStatus;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  feeA!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  feeB!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  feeC!: number;

  // Заблокована частина (D)
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  holdD!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  loan!: number;

  // Доступна для виплати сума на даний момент
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  available!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
