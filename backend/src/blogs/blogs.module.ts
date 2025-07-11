import { Module } from "@nestjs/common";
import { BlogsService } from "./blogs.service";
import { BlogsController } from "./blogs.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Blog } from "./entities/blog.entity";
import { User } from "src/users/entities/user.entity";
import { Subcategory } from "src/subcategories/entities/subcategory.entity";
import { Category } from "src/categories/entities/category.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Blog, User, Subcategory, Category])],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}
