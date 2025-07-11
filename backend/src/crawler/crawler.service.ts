// src/crawler/crawler.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { HttpService } from "@nestjs/axios";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NewsArticle } from "./entities/news-article.entity";
import * as cheerio from "cheerio";
import { firstValueFrom } from "rxjs";
import weaviate, { WeaviateClient } from "weaviate-ts-client";
import { BlogsService } from "../blogs/blogs.service";
import { ConfigService } from "@nestjs/config";
import * as puppeteer from "puppeteer";
import axios from "axios";
import * as xml2js from "xml2js";

import OpenAI from "openai";

interface SourceConfig {
  url: string;
  articleSelector: string;
  titleSelector: string;
  contentSelector: string;
  dateSelector?: string; // Optional, not used in this example
}
function extractAndParseDate(input: string): string | null {
  const regex =
    /(?:updated:\s*)?([A-Za-z]{3,9})\s+(\d{1,2}),\s+(\d{4})(?:[, ]+(\d{1,2}:\d{2})(?:\s*(AM|PM))?(?:\s*(ET|EDT|EST))?)?/i;

  const match = input.match(regex);
  if (!match) return null;

  let [_, month, day, year, time, meridian] = match;

  time = time || "00:00";
  meridian = meridian || "";

  // Build a date string *without* the timezone
  const dateStr = `${month} ${day}, ${year} ${time} ${meridian}`.trim();

  const parsedDate = new Date(dateStr);

  if (isNaN(parsedDate.getTime())) return null;

  return parsedDate.toISOString();
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private weaviateClient: WeaviateClient;

  constructor(
    private readonly http: HttpService,
    @InjectRepository(NewsArticle)
    private readonly articleRepo: Repository<NewsArticle>,
    private readonly blogsService: BlogsService,
    private readonly configService: ConfigService
  ) {
    this.weaviateClient = weaviate.client({
      scheme: this.configService.get<string>("WEAVIATE_SCHEME") || "http",
      host: this.configService.get<string>("WEAVIATE_HOST") || "localhost:8080",
    });
    this.ensureWeaviateSchema();
  }

  private async ensureWeaviateSchema() {
    try {
      const schemaRes = await this.weaviateClient.schema
        .classGetter()
        .withClassName("NewsArticle")
        .do();
      if (schemaRes) return; // Class exists
    } catch (e) {
      // Class does not exist, create it
      await this.weaviateClient.schema
        .classCreator()
        .withClass({
          class: "NewsArticle",
          description: "A news article scraped from mining news sources.",
          vectorizer: "text2vec-transformers",
          moduleConfig: {
            "text2vec-transformers": {
              vectorizeClassName: true,
            },
          },
          properties: [
            { name: "title", dataType: ["text"] },
            { name: "content", dataType: ["text"] },
            { name: "url", dataType: ["text"] },
          ],
        })
        .do();
      this.logger.log("Weaviate NewsArticle class created.");
    }
  }

  private SOURCES: SourceConfig[] = [
    // {
    //   url: "https://www.newswire.com/newsroom/industries-mining",
    //   articleSelector: "a.more-btn",
    //   titleSelector: "h1.article-header",
    //   contentSelector: "div.pr-html",
    //   dateSelector:
    //     "#cv-container > main > section > div.pr-body-wrapper > article > div.article-info > span.ai-date",
    // },
    {
      url: "https://www.newswire.ca/news-releases/heavy-industry-manufacturing-latest-news/mining-metals-list/",
      articleSelector: "a.newsreleaseconsolidatelink",
      titleSelector: "h1",
      contentSelector: "#main > article > section > div:nth-child(1) > div",
      dateSelector:
        "#main > article > header > div > div:nth-child(4) > div.col-lg-8.col-md-8.col-sm-7.swaping-class-left > p",
    },
    {
      url: "https://www.newsfilecorp.com/news/mining-metals",
      articleSelector: "a.ln-title",
      titleSelector: "h1",
      contentSelector: "#release > p",
      dateSelector: "#release > header > h3",
    },
    {
      url: "https://www.prnewswire.com/news-releases/energy-latest-news/mining-metals-list",
      articleSelector: "a.newsreleaseconsolidatelink",
      titleSelector: "h1",
      contentSelector: "#main > article > section > div:nth-child(1) > div > p",
      dateSelector:
        "#main > article > header > div > div:nth-child(4) > div.col-lg-8.col-md-8.col-sm-7.swaping-class-left > p",
    },
    {
      url: "https://www.globenewswire.com/en/search/industry/Gold%252520Mining",
      articleSelector: "div.mainLink > a",
      titleSelector: "div.main-header-container > h1",
      contentSelector: "#main-body-container > p",
      dateSelector:
        "#container-article > div.main-container-content > div.main-header-container > p > span.d-flex.justify-content-start > span.article-published > time",
    },
  ];

  @Cron("*/10 * * * *") // every 10 minutes
  async handleCron() {
    this.logger.log("Starting news crawling via scheduler...");

    await Promise.all([this.scrapeAllSources(), this.scrapeGoogleSources()]);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async scrapeAllSources() {
    for (const source of this.SOURCES) {
      try {
        const { data } = await firstValueFrom(
          this.http.get(source.url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            },
          })
        );

        const $ = cheerio.load(data);
        const articleLinks: string[] = [];
        $(source.articleSelector).each((_, el) => {
          const href = $(el).attr("href");
          if (!href) return;
          const absoluteUrl = href.startsWith("http")
            ? href
            : new URL(href, source.url).href;
          articleLinks.push(absoluteUrl);
        });
        console.log(`Found ${articleLinks.length} articles in ${source.url}`);
        for (const url of articleLinks) {
          try {
            await this.delay(1500); //  limiter delay per request

            const { data: articleHtml } = await firstValueFrom(
              this.http.get(url, {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                },
              })
            );

            const $$ = cheerio.load(articleHtml);
            const title = $$(source.titleSelector).text().trim();
            const content = $$(source.contentSelector).text().trim();
            const dateString = $$(source.dateSelector).text();

            const date = extractAndParseDate(dateString);
            console.log("computer readable date is ", date);

            // Date filter: keep only articles from today or yesterday
            if (date) {
              const articleDate = new Date(date);
              const now = new Date();
              const yesterday = new Date();
              yesterday.setDate(now.getDate() - 1);
              // Zero out time for comparison
              articleDate.setHours(0, 0, 0, 0);
              now.setHours(0, 0, 0, 0);
              yesterday.setHours(0, 0, 0, 0);
              if (
                articleDate.getTime() !== now.getTime() &&
                articleDate.getTime() !== yesterday.getTime()
              ) {
                this.logger.log(
                  `⏩ Skipping article not from today or yesterday: ${title} (${articleDate.toISOString()})`
                );
                continue;
              }
            } else {
              this.logger.log(
                `⏩ Skipping article with invalid date: ${title}`
              );
              continue;
            }

            ////
            if (!title || !content) continue;

            // Semantic duplicate check with Weaviate
            const nearText = {
              concepts: [title + " " + content],
              distance: 0.08, // 1 - similarity threshold (e.g., 0.92)
            };
            const duplicate = await this.weaviateClient.graphql
              .get()
              .withClassName("NewsArticle")
              .withFields("title url _additional {certainty}")
              .withNearText(nearText)
              .withLimit(1)
              .do();
            if (
              duplicate?.data?.Get?.NewsArticle?.length > 0 &&
              duplicate.data.Get.NewsArticle[0]._additional?.certainty > 0.92
            ) {
              this.logger.log(
                `⚠️ Duplicate found in Weaviate, skipping: ${title}`
              );
              continue;
            }

            const exists = await this.articleRepo.findOne({ where: { url } });
            if (exists) continue;
            const article = this.articleRepo.create({ title, content, url });
            await this.articleRepo.save(article);
            // Summarize and rewrite title using OpenAI
            const openai = new OpenAI({
              apiKey: this.configService.get<string>("OPENAI_API_KEY"),
            });
            const prompt = `Summarize the following news article in 100 words or less and suggest a catchy title rewrite this article for me in goldbuzz style news .remove any reference to the newspage or site  and all other personal site information.\n\nArticle:\n${content}`;
            const completion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant for summarizing news articles.",
                },
                { role: "user", content: prompt },
              ],
              max_tokens: 512,
            });
            const aiResponse = completion.choices[0].message?.content || "";
            // Parse summary and title from AI response
            let summary = aiResponse;
            let aiTitle = title;
            const titleMatch = aiResponse.match(/title\s*[:\-]?\s*(.*)/i);
            if (titleMatch) {
              aiTitle = titleMatch[1].trim();
              summary = aiResponse.replace(titleMatch[0], "").trim();
            }
            console.log("AI Title:", aiTitle);
            console.log("AI Summary:", summary);
            // Save to Blog table (assign userId and subCategoryId as needed)
            // this.logger.log(`Admin ID: ${this.adminId}`);
            try {
              const blog = await this.blogsService.create({
                title: aiTitle,
                content: summary,
                userId: "808af945-08fc-4d34-9dae-a84545fcb2d4",
                subCategoryId: "6dddd7c9-c372-4d26-909d-b3c121fce972",
              });
              this.logger.log(`📝 Blog created: ${aiTitle} (ID: ${blog.id})`);
            } catch (err) {
              this.logger.error(`❌ Failed to create blog: ${err.message}`);
            }

            // Add to Weaviate
            await this.weaviateClient.data
              .creator()
              .withClassName("NewsArticle")
              .withProperties({ title, content, url })
              .do();
          } catch (err) {
            this.logger.warn(
              `❌ Failed to fetch article at ${url}: ${err.message}`
            );
          }
        }
      } catch (err) {
        this.logger.error(
          `❌ Failed to scrape source ${source.url}: ${err.message}`
        );
      }
    }
  }
  async scrapeGoogleSources() {
    const SOURCES = [
      {
        url: "https://news.google.com/rss/search?q=gold&hl=en-US&gl=US&ceid=US:en",
        type: "rss",
      },
    ];

    const isTodayOrYesterday = (dateStr) => {
      const pubDate = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      return isSameDay(pubDate, today) || isSameDay(pubDate, yesterday);
    };

    const countWords = (text) => text.trim().split(/\s+/).length;
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    for (const source of SOURCES) {
      try {
        this.logger.log(`🌐 Scraping RSS: ${source.url}`);
        const response = await axios.get(source.url);
        const rssData = await xml2js.parseStringPromise(response.data);
        const items = rssData.rss.channel[0].item || [];

        let scrapedCount = 0;
        for (const item of items) {
          if (scrapedCount >= 10) break;

          const title = item.title?.[0] || "";
          const url = item.link?.[0] || "";
          const pubDateRaw = item.pubDate?.[0] || "";
          //1st check of date
          if (!isTodayOrYesterday(pubDateRaw)) {
            this.logger.log(`Old Article found, skipping: ${title}`);
            continue;
          }

          const pubDate = new Date(pubDateRaw).toISOString();

          try {
            this.logger.log(`🔗 Visiting (Google URL): ${url}`);
            await page.goto(url, {
              waitUntil: "domcontentloaded",
              timeout: 30000,
            });

            await new Promise((resolve) => setTimeout(resolve, 2000));
            const realUrl = page.url();

            await page.goto(realUrl, {
              waitUntil: "domcontentloaded",
              timeout: 30000,
            });

            const content = await page.evaluate(() => {
              const body = document.body;
              const elements = body ? body.querySelectorAll("p, div") : [];
              const textNodes = Array.from(elements)
                .map((el) => el.innerText.trim())
                .filter(
                  (t) =>
                    t &&
                    t.trim().split(/\s+/).length > 30 &&
                    !t.includes("\t\t\t") &&
                    !t.match(/\b\w+( {4,})\w+\b/)
                );
              return textNodes.join("\n\n");
            });
            //2nd check of content
            console.log(`Content length: ${content.length}`);
            console.log(`Title: ${title}`);
            console.log(`Content: ${content.slice(0, 100)}`);
            if (!title || countWords(content) < 50) {
              this.logger.log(`Title or content is missing Skipping: ${title}`);
              continue;
            }

            const nearText = {
              concepts: [title + " " + content],
              distance: 0.08,
            };
            const duplicate = await this.weaviateClient.graphql
              .get()
              .withClassName("NewsArticle")
              .withFields("title url _additional {certainty}")
              .withNearText(nearText)
              .withLimit(1)
              .do();
            if (
              duplicate?.data?.Get?.NewsArticle?.length > 0 &&
              duplicate.data.Get.NewsArticle[0]._additional?.certainty > 0.92
            ) {
              //3rd check  Duplicate found in Weaviate
              this.logger.log(
                `⚠️ Duplicate found in Weaviate, skipping: ${title}`
              );
              continue;
            }
            await this.weaviateClient.data
              .creator()
              .withClassName("NewsArticle")
              .withProperties({ title, content, url: realUrl })
              .do();
            //4th  Check if article already exists in the database
            const exists = await this.articleRepo.findOne({
              where: { url: realUrl },
            });
            if (exists) {
              this.logger.log(
                `⚠️ Duplicate url found in database, skipping: ${title}`
              );
              continue;
            }

            const article = this.articleRepo.create({
              title,
              content,
              url: realUrl,
            });

            await this.articleRepo.save(article);

            const openai = new OpenAI({
              apiKey: this.configService.get("OPENAI_API_KEY"),
            });

            const prompt = `Summarize the following news article in 100 words or less and suggest a catchy title. Rewrite this article for me in goldbuzz style news. Remove any reference to the newspage or site and all other personal site information.\n\nArticle:\n${content}`;

            const completion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant for summarizing news articles.",
                },
                { role: "user", content: prompt },
              ],
              max_tokens: 512,
            });

            const aiResponse = completion.choices[0].message?.content || "";
            let summary = aiResponse;
            let aiTitle = title;
            const titleMatch = aiResponse.match(/title\s*[:\-]?\s*(.*)/i);
            if (titleMatch) {
              aiTitle = titleMatch[1].trim();
              summary = aiResponse.replace(titleMatch[0], "").trim();
            }
            console.log("AI Title:", aiTitle);
            console.log("AI Summary:", summary);
            await this.blogsService.create({
              title: aiTitle,
              content: summary,
              userId: "808af945-08fc-4d34-9dae-a84545fcb2d4",
              subCategoryId: "6dddd7c9-c372-4d26-909d-b3c121fce972",
            });
            this.logger.log(`📝 Blog created: ${aiTitle}`);

            scrapedCount++;
            await this.delay(1500);
          } catch (err) {
            this.logger.warn(
              `❌ Failed to fetch article at ${url}: ${err.message}`
            );
          }
        }
      } catch (err) {
        this.logger.error(
          `❌ Failed to scrape source ${source.url}: ${err.message}`
        );
      }
    }

    await browser.close();
  }
}
