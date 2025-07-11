// src/crawler/crawler.module.ts
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";

import { CrawlerService } from "./crawler.service";
import { CrawlerController } from "./crawler.controller";
import { NewsArticle } from "./entities/news-article.entity";
import { BlogsModule } from "../blogs/blogs.module";
import { Blog } from "src/blogs/entities/blog.entity";
import { User } from "src/users/entities/user.entity";
import { Subcategory } from "src/subcategories/entities/subcategory.entity";
import { Category } from "src/categories/entities/category.entity";
import { BlogsService } from "src/blogs/blogs.service";

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([NewsArticle, Blog, User, Subcategory, Category]),
    BlogsModule, // Import BlogsModule to provide BlogsService
    ConfigModule, // Import ConfigModule to provide environment variables
  ],
  providers: [CrawlerService, BlogsService],
  controllers: [CrawlerController],
})
export class CrawlerModule {}
