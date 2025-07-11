import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"; // 👈 import
import * as express from "express";
import { UploadConfig } from "./config/upload.config";

import * as fs from "fs";
import * as path from "path";
async function bootstrap() {
  // Ensure upload directories exist before starting the app
  UploadConfig.ensureUploadDirectoriesExist();
  
  const app = await NestFactory.create(AppModule);

  // Run seeder before starting the app
  const seedService = app.get(
    (await import("./seed.service")).SeedService
  );
  await seedService.seed();

  // Enable CORS
  app.enableCors({
    origin: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("My API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .addBearerAuth() // Optional: if you're using JWT or token auth
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document); // Docs at /api-docs

  app.use("/uploads", express.static("uploads"));
  // app.useStaticAssets(join(__dirname, "..", "uploads"));
  // const seedFlagPath = path.join(__dirname, "..", "seed", ".seeded");
  // const excelService = app.get(ExcelService);

  // if (!fs.existsSync(seedFlagPath)) {
  //   console.log("Seeding Excel data from backend...");

  //   await excelService.seedExcelDataFromFile(
  //     path.join(__dirname, "..", "seed", "excel-data.xlsx")
  //   );
  //   await excelService.seedIndustriesFromFile(
  //     path.join(__dirname, "..", "seed", "industries.xlsx")
  //   );
  //   await excelService.seedMappingFromFile(
  //     path.join(__dirname, "..", "seed", "mapping.xlsx")
  //   );

  //   fs.writeFileSync(seedFlagPath, "seeded");
  //   console.log("Seeding complete.");
  // } else {
  //   console.log("Seed already applied, skipping...");
  // }
  await app.listen(
    process.env.PORT || 3002,
    "0.0.0.0" // ✅ CORRECT
  );
  console.log(`Server running on address: ${await app.getUrl()}`);
  // console.info(`Server running on ${await app.getUrl()}`);
  // console.info(`Swagger docs at ${await app.getUrl()}/api-docs`);
}

bootstrap();
