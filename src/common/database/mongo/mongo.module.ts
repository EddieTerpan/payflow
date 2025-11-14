import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(`${process.env.MONGO_URI}`, {
      dbName: 'payflow',
    }),
  ],
  exports: [MongooseModule],
})
export class MongoModule {}
