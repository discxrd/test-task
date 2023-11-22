import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { ContactDto } from 'src/contacts/contacts.dto';

@Injectable()
export class AmocrmService {
  private readonly logger = new Logger(AmocrmService.name);

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private readonly DOMAIN: string = this.configService.get('AMOCRM_DOMAIN');
  private readonly URL: string = `https://${this.DOMAIN}.amocrm.ru`;
  private accessToken: string = '';
  private refreshToken: string = '';
  private expiresIn: number = 0;
  private lastRequestDate: number = 0;

  async auth() {
    const url = `${this.URL}/oauth2/access_token`;

    const authData = {
      client_id: this.configService.get('AMOCRM_CLIENT_ID'),
      client_secret: this.configService.get('AMOCRM_CLIENT_SECRET'),
      grant_type: 'authorization_code',
      code: this.configService.get('AMOCRM_CODE'),
      redirect_uri: this.configService.get('AMOCRM_REDIRECT_URI'),
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(url, authData),
      );

      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.expiresIn = data.expires_in;
      this.logger.debug('Succeful AmoCRM auth');
      this.lastRequestDate = Date.now();
    } catch (error) {
      this.logger.error(error.response.data);
      throw 'An error happened!';
    }
  }

  async getNewTokens() {
    if (!this.refreshToken) {
      await this.auth();
      return;
    }

    if (Date.now() < this.lastRequestDate + this.expiresIn) {
      return;
    }

    const url = `${this.URL}/oauth2/access_token`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(url, {
          client_id: this.configService.get('AMOCRM_CLIENT_ID'),
          client_secret: this.configService.get('AMOCRM_CLIENT_SECRET'),
          grant_type: 'refresh_token',
          refresh_token: this.configService.get('AMOCRM_REFRESH_TOKEN'),
          redirect_uri: this.configService.get('AMOCRM_REDIRECT_URI'),
        }),
      );

      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.expiresIn = data.expires_in;
      this.lastRequestDate = Date.now();
    } catch (error) {
      this.logger.error(error.response.data);
      throw new Error('An error happened!');
    }
  }

  async getContact(dto: ContactDto): Promise<number> {
    await this.getNewTokens();

    const url = `${this.URL}/api/v4/contacts?query=${dto.phone}`;

    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url, { headers: headers }),
      );

      var contactId = data._embedded?.contacts[0]?.id;

      return contactId;
    } catch (error) {
      this.logger.error(error.response.data);
      throw 'An error happened!';
    }
  }

  async createContact(dto: ContactDto): Promise<number> {
    await this.getNewTokens();

    const url = `${this.URL}/api/v4/contacts`;

    const contactData = [
      {
        name: dto.name,
        custom_fields_values: [
          { field_code: 'PHONE', values: [{ value: dto.phone }] },
          { field_code: 'EMAIL', values: [{ value: dto.email }] },
        ],
      },
    ];

    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(url, contactData, { headers: headers }),
      );

      return data;
    } catch (error) {
      this.logger.error(error.response.data);
      throw 'An error happened!';
    }
  }

  async updateContact(dto: ContactDto, contactId: number) {
    await this.getNewTokens();

    const url = `${this.URL}/api/v4/contacts/${contactId}`;

    const contactData = [
      {
        name: dto.name,
        custom_fields_values: [
          { field_code: 'PHONE', values: [{ value: dto.phone }] },
          { field_code: 'EMAIL', values: [{ value: dto.email }] },
        ],
      },
    ];

    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(url, contactData, { headers: headers }),
      );

      return data;
    } catch (error) {
      this.logger.error(error.response.data);
      throw 'An error happened!';
    }
  }

  async createLead(dto: ContactDto, contactId: number): Promise<number> {
    await this.getNewTokens();

    const url = `${this.URL}/api/v4/leads`;

    const leadData = [
      {
        _embedded: { contacts: [{ id: contactId }] },
      },
    ];

    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(url, leadData, { headers: headers }),
      );

      return data;
    } catch (error) {
      this.logger.error(error.response.data);
      throw 'An error happened!';
    }
  }
}
