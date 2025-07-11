import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { BlogsService } from "./blogs.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { UploadedFiles } from "@nestjs/common";
import { EnsureUploadDirectoriesInterceptor } from "../interceptors/ensure-upload-directories.interceptor";

// blogs.controller.ts
@Controller("blogs")
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseInterceptors(
    EnsureUploadDirectoriesInterceptor,
    FileFieldsInterceptor(
      [
        { name: "image", maxCount: 1 },
        { name: "titleImage", maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: "./uploads/blogs",
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
          },
        }),
      }
    )
  )
  async create(
    @Body() dto: CreateBlogDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      titleImage?: Express.Multer.File[];
    }
  ) {
    const imageFile = files.image?.[0];
    const titleImageFile = files.titleImage?.[0];

    const imagePath = imageFile ? `/uploads/blogs/${imageFile.filename}` : null;
    const mediaType = imageFile
      ? imageFile.mimetype.startsWith("video/")
        ? "video"
        : "image"
      : null;

    const titleImagePath = titleImageFile
      ? `/uploads/blogs/${titleImageFile.filename}`
      : null;

    return this.blogsService.create({
      ...dto,
      image: imagePath,
      mediaType,
      titleImage: titleImagePath,
    });
  }

  @Get()
  findAll() {
    return this.blogsService.findAll();
  }

  //////////////////////////
  @Get("monthly-count")
  async getMonthlyBlogCount() {
    return this.blogsService.getMonthlyBlogCount();
  }

  @Get("categories-stats")
  async getCategoriesStats() {
    return this.blogsService.getCategoriesStats();
  }
  //////////////////////
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.blogsService.findOne(id);
  }
  @Get("user/:userId")
  findAllByUser(@Param("userId") userId: string) {
    return this.blogsService.findAllByUserId(userId);
  }
  @Patch(":id")
  @UseInterceptors(
    EnsureUploadDirectoriesInterceptor,
    FileFieldsInterceptor(
      [
        { name: "image", maxCount: 1 },
        { name: "titleImage", maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: "./uploads/blogs",
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
          },
        }),
      }
    )
  )
  update(
    @Param("id") id: string,
    @Body() dto: UpdateBlogDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      titleImage?: Express.Multer.File[];
    }
  ) {
    const imageFile = files.image?.[0];
    const titleImageFile = files.titleImage?.[0];

    const imagePath = imageFile ? `/uploads/blogs/${imageFile.filename}` : undefined;
    const titleImagePath = titleImageFile ? `/uploads/blogs/${titleImageFile.filename}` : undefined;
    const mediaType = imageFile
      ? imageFile.mimetype.startsWith("video/")
        ? "video"
        : "image"
      : undefined;

    return this.blogsService.update(id, {
      ...dto,
      ...(imagePath && { image: imagePath }),
      ...(titleImagePath && { titleImage: titleImagePath }),
      ...(mediaType && { mediaType }),
    });
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.blogsService.remove(id);
  }

  @Post("upload-media")
  @UseInterceptors(
    EnsureUploadDirectoriesInterceptor,
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/blogs/editor",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept images and videos
        if (
          file.mimetype.startsWith("image/") ||
          file.mimetype.startsWith("video/")
        ) {
          cb(null, true);
        } else {
          cb(new Error("Only images and videos are allowed!"), false);
        }
      },
    })
  )
  async uploadEditorMedia(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error("No file uploaded");
    }
    return {
      url: `${process.env.BACKEND_URL || ""}/uploads/blogs/editor/${file.filename}`,
      filename: file.filename,
    };
  }
}
