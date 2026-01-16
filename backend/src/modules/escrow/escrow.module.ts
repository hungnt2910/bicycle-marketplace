import { Module } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema, Transaction, TransactionSchema } from 'src/entities';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: AuditLog.name, schema: AuditLogSchema },
        { name: Transaction.name, schema: TransactionSchema},
        // { name: Dispute.name, schema: DisputeSchema },
      ]),
    ],
  providers: [EscrowService],
  controllers: [EscrowController]
})
export class EscrowModule {}
