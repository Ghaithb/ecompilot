import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { Account, AccountSchema, Transaction, TransactionSchema } from './schemas/accounting.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Account.name, schema: AccountSchema },
            { name: Transaction.name, schema: TransactionSchema },
        ]),
    ],
    controllers: [AccountingController],
    providers: [AccountingService],
    exports: [AccountingService, MongooseModule],
})
export class AccountingModule { }
