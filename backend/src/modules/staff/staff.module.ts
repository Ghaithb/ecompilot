import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { Staff, StaffSchema, TimeEntry, TimeEntrySchema, Expense, ExpenseSchema } from './schemas/staff.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Staff.name, schema: StaffSchema },
            { name: TimeEntry.name, schema: TimeEntrySchema },
            { name: Expense.name, schema: ExpenseSchema },
        ]),
    ],
    controllers: [StaffController],
    providers: [StaffService],
    exports: [StaffService, MongooseModule],
})
export class StaffModule { }
