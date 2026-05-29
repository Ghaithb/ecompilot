import { Module } from '@nestjs/common';
import { I18nModule } from 'nestjs-i18n';
import { I18nJsonLoader } from 'nestjs-i18n/dist/loaders/i18n.json.loader';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'fr',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname),
        watch: true,
      },
    }),
  ],
})
export class AppI18nModule {}
