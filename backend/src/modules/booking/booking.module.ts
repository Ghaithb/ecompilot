import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { Service, ServiceSchema } from './schemas/service.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Booking.name, schema: BookingSchema },
            { name: Service.name, schema: ServiceSchema },
        ]),
    ],
    controllers: [BookingController],
    providers: [BookingService],
    exports: [BookingService, MongooseModule],
})
export class BookingModule { }
