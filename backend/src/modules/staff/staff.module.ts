import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
