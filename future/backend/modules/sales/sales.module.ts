import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Quote, QuoteSchema, Invoice, InvoiceSchema } from './schemas/sales.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Quote.name, schema: QuoteSchema },
            { name: Invoice.name, schema: InvoiceSchema },
        ]),
    ],
    controllers: [SalesController],
    providers: [SalesService],
    exports: [SalesService, MongooseModule],
})
export class SalesModule { }
