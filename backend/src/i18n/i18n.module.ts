import { Module } from '@nestjs/common';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { I18nJsonLoader } from 'nestjs-i18n/dist/loaders/i18n.json.loader';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'fr',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(process.cwd(), 'src/i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-custom-lang']),
      ],
    }),
  ],
})
export class AppI18nModule {}
