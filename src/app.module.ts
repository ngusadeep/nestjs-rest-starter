import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule } from 'src/config/config.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { LoggerModule } from 'src/core/logger/logger.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    RolesModule,
    SeederModule,
    LoggerModule,
    // AuthModule,
    // RolesModule,
    // AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
