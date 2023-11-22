import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmocrmService } from './amocrm.service';

@Module({
    imports: [HttpModule, ConfigModule.forRoot()],
    providers: [AmocrmService],
    exports: [AmocrmService],
})
export class AmocrmModule {}
