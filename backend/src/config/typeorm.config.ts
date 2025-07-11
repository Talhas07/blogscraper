import { DataSource, DataSourceOptions } from "typeorm";
import { ConfigService } from "@nestjs/config";

const configService = new ConfigService();

export default new DataSource({
  type: "postgres",
  host: configService.get("DB_HOST", "localhost"),
  port: configService.get("DB_PORT", 5432),
  username: configService.get("DB_USERNAME", "postgres"),
  password: configService.get("DB_PASSWORD", "11111111"),
  database: configService.get("DB_DATABASE", "blog"),
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/../migrations/*{.ts,.js}"],
} as DataSourceOptions);
