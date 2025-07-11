import { InjectRepository } from "@nestjs/typeorm";
import { Blog } from "./entities/blog.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { Subcategory } from "src/subcategories/entities/subcategory.entity";
import * as fs from "fs";
import * as path from "path";
import { subMonths, format } from "date-fns";
import { Category } from "src/categories/entities/category.entity";
import { UploadConfig } from "../config/upload.config";

// blogs.service.ts
@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private blogRepo: Repository<Blog>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Subcategory) private subRepo: Repository<Subcategory>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>
  ) {
    // Ensure upload directories exist when service is initialized
    UploadConfig.ensureUploadDirectoriesExist();
  }

  async create(
    createBlogDto: CreateBlogDto & { image?: string; titleImage?: string }
  ) {
    const { userId, subCategoryId, image, titleImage, ...rest } = createBlogDto;

    const user = await this.userRepo.findOneBy({ id: userId });
    const subCategory = await this.subRepo.findOneBy({ id: subCategoryId });

    if (!user) throw new Error("User not found");
    if (!subCategory) throw new Error("Subcategory not found");

    const blog = this.blogRepo.create({
      ...rest,
      user,
      subCategory,
      image,
      titleImage,
    });

    return this.blogRepo.save(blog);
  }

  findAll() {
    return this.blogRepo.find({ relations: ["user"] });
  }
  async findAllByUserId(userId: string): Promise<Blog[]> {
    return this.blogRepo.find({
      where: { user: { id: userId } },
      relations: ["subCategory", "user"],
      order: { createdAt: "DESC" },
    });
  }
  findOne(id: string) {
    return this.blogRepo.findOne({ where: { id }, relations: ["user"] });
  }

  async update(id: string, updateBlogDto: UpdateBlogDto & { image?: string }) {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ["user", "subCategory"],
    });

    if (!blog) {
      throw new NotFoundException("Blog not found");
    }

    const { userId, subCategoryId, image, ...rest } = updateBlogDto;

    // If userId is provided, fetch and set user
    if (userId) {
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) throw new NotFoundException("User not found");
      blog.user = user;
    }

    // If subCategoryId is provided, fetch and set subCategory
    if (subCategoryId) {
      const subCategory = await this.subRepo.findOneBy({ id: subCategoryId });
      if (!subCategory) throw new NotFoundException("Subcategory not found");
      blog.subCategory = subCategory;
    }

    // If new image is provided, optionally remove the old one
    if (image && blog.image && blog.image !== image) {
      const oldImagePath = path.join(process.cwd(), blog.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      blog.image = image;
    }

    // Apply other updates
    Object.assign(blog, rest);

    return this.blogRepo.save(blog);
  }

  remove(id: string) {
    return this.blogRepo.delete(id);
  }

  ///////////////////////////////////////////////////////////////////////////
  async getMonthlyBlogCount() {
    const sixMonthsAgo = subMonths(new Date(), 6);

    const blogs = await this.blogRepo
      .createQueryBuilder("blog")
      .select("DATE_TRUNC('month', blog.createdAt) as month")
      .addSelect("COUNT(*) as count")
      .where("blog.createdAt >= :date", { date: sixMonthsAgo })
      .groupBy("month")
      .orderBy("month", "ASC")
      .getRawMany();

    const labels = [];
    const data = [];
    let currentMonth = new Date(sixMonthsAgo);
    const now = new Date();

    while (currentMonth <= now) {
      const monthStr = format(currentMonth, "MMM yyyy");
      const monthData = blogs.find(
        (b) => format(new Date(b.month), "MMM yyyy") === monthStr
      );
      labels.push(monthStr);
      data.push(monthData ? Number(monthData.count) : 0);
      currentMonth = new Date(
        currentMonth.setMonth(currentMonth.getMonth() + 1)
      );
    }

    return { labels, data };
  }

  async getCategoriesStats() {
    const categories = await this.categoryRepo.find({
      relations: ["subcategories"],
    });

    const labels = categories.map((cat) => cat.name);
    const subcategoryCounts = categories.map((cat) => cat.subcategories.length);

    const blogCounts = await this.subRepo
      .createQueryBuilder("subcategory")
      .leftJoin("subcategory.blogs", "blog")
      .select("subcategory.id")
      .addSelect("subcategory.name")
      .addSelect("COUNT(blog.id) as blogCount")
      .groupBy("subcategory.id")
      .getRawMany();

    const blogCountData = categories.map((cat) => {
      return cat.subcategories.reduce((sum, subcat) => {
        const subcatData = blogCounts.find(
          (bc) => bc.subcategory_id === subcat.id
        );
        return sum + (subcatData ? Number(subcatData.blogCount) : 0);
      }, 0);
    });

    return {
      labels,
      datasets: [
        {
          label: "Subcategories",
          data: subcategoryCounts,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
        {
          label: "Blogs",
          data: blogCountData,
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };
  }
}
