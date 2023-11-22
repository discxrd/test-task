import { Injectable } from '@nestjs/common';
import { ContactDto } from './contacts.dto';
import { AmocrmService } from 'src/amocrm/amocrm.service';

@Injectable()
export class ContactsService {
  constructor(private readonly amocrmService: AmocrmService) {}

  async get(dto: ContactDto) {
    var contactId = await this.amocrmService.getContact(dto);

    if (!contactId) {
      const data = await this.amocrmService.createContact(dto);
      contactId = data['_embedded']['contacts'][0]['id'];

      await this.amocrmService.createLead(dto, contactId);

      return { message: 'Пользователь и сделка создана' };
    }

    await this.amocrmService.updateContact(dto, contactId);
    await this.amocrmService.createLead(dto, contactId);

    return { message: 'Сделка создана' };
  }
}
