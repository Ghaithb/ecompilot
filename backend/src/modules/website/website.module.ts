import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebsiteController } from './website.controller';
import { PublicWebsiteController } from './public-website.controller';
import { PublicStoreController } from './public-store.controller';
import { WebsiteService } from './website.service';
import { PageService } from './page.service';
import { Website, WebsiteSchema } from './schemas/website.schema';
import { Page, PageSchema } from './schemas/page.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { ContactMessage, ContactMessageSchema } from './schemas/contact-message.schema';
import { NewsletterSubscriber, NewsletterSubscriberSchema } from './schemas/newsletter.schema';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentModule } from '../payment/payment.module';
import { CustomersModule } from '../customers/customers.module';
import { CartModule } from '../cart/cart.module';
import { MvpSiteContentService } from './services/mvp-site-content.service';
import { SmartWebsiteGeneratorService } from './services/smart-website-generator.service';
import { WebsiteDomainService } from './website-domain.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Website.name, schema: WebsiteSchema },
      { name: Page.name, schema: PageSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: ContactMessage.name, schema: ContactMessageSchema },
      { name: NewsletterSubscriber.name, schema: NewsletterSubscriberSchema },
    ]),
    ProductsModule,
    OrdersModule,
    PaymentModule,
    CustomersModule,
    forwardRef(() => CartModule),
  ],
  controllers: [WebsiteController, PublicWebsiteController, PublicStoreController],
  providers: [
    WebsiteService,
    PageService,
    MvpSiteContentService,
    SmartWebsiteGeneratorService,
    WebsiteDomainService,
  ],
  exports: [
    WebsiteService,
    PageService,
    SmartWebsiteGeneratorService,
  ],
})
export class WebsiteModule {}
