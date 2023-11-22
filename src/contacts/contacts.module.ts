import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { AmocrmModule } from 'src/amocrm/amocrm.module';

@Module({
  imports: [AmocrmModule],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}
