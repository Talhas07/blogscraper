import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import * as fs from "fs";
import * as path from "path";
import { User, UserRole } from "./users/entities/user.entity";
import { Subcategory } from "./subcategories/entities/subcategory.entity";
import { Category } from "./categories/entities/category.entity";
import * as bcrypt from "bcryptjs";

@Injectable()
export class SeedService {
  private readonly flagPath = path.join(__dirname, "..", "seed", ".seeded");

  constructor(private dataSource: DataSource) {}

  async seed() {
    if (fs.existsSync(this.flagPath)) {
      console.log("Seed already applied, skipping...");
      return;
    }

    // Ensure the seed directory exists
    fs.mkdirSync(path.dirname(this.flagPath), { recursive: true });

    // Create or find a category for the subcategory
    let category = await this.dataSource.getRepository(Category).findOne({
      where: { name: "Default" },
    });
    if (!category) {
      category = await this.dataSource.getRepository(Category).save({
        name: "Default",
        isActive: true,
      });
    }

    // Create the subcategory
    await this.dataSource.getRepository(Subcategory).save({
      id: "6dddd7c9-c372-4d26-909d-b3c121fce972",
      name: "artificial",
      isActive: true,
      category: category,
    });

    // Create the user
    const passwordHash = await bcrypt.hash("adminpassword", 10);
    await this.dataSource.getRepository(User).save({
      id: "808af945-08fc-4d34-9dae-a84545fcb2d4",
      firstName: "admin",
      lastName: "",
      email: "admin@example.com",
      password: passwordHash,
      isAdmin: true,
      type: UserRole.ADMIN,
      isActive: true,
      avatar: null,
    });

    fs.writeFileSync(this.flagPath, "seeded");
    console.log("Seeding complete.");
  }
} 