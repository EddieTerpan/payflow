import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePaymentsTable1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'merchantId', type: 'varchar' },

          { name: 'amount', type: 'decimal', precision: 12, scale: 2 },

          {
            name: 'status',
            type: 'enum',
            enum: [
              'ACCEPTED',
              'PROCESSED',
              'COMPLETED',
              'PAID_PENDING',
              'PAID',
            ],
            default: `'ACCEPTED'`,
          },

          { name: 'feeA', type: 'decimal', precision: 12, scale: 2, default: 0 },
          { name: 'feeB', type: 'decimal', precision: 12, scale: 2, default: 0 },
          { name: 'feeC', type: 'decimal', precision: 12, scale: 2, default: 0 },

          { name: 'holdD', type: 'decimal', precision: 12, scale: 2, default: 0 },
          { name: 'available', type: 'decimal', precision: 12, scale: 2, default: 0 },

          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
  }
}
