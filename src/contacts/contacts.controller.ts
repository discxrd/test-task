import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactDto } from './contacts.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  get(@Query() dto: ContactDto): Promise<any> {
    return this.contactsService.get(dto);
  }
}
