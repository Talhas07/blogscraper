// src/crawler/crawler.controller.ts
import { Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { CrawlerService } from "./crawler.service";

@Controller("crawler")
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post("run")
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerCrawl() {
    await this.crawlerService.scrapeAllSources();
    return { message: "Crawling manually triggered" };
  }
  @Post("run2")
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerCrawlGoogle() {
    await this.crawlerService.scrapeGoogleSources();
    return { message: "Google Crawling manually triggered" };
  }
}
