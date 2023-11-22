import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactsModule } from './contacts/contacts.module';
import { AmocrmModule } from './amocrm/amocrm.module';

@Module({
  imports: [ContactsModule, AmocrmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
