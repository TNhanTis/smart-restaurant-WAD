import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]),
  ],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
