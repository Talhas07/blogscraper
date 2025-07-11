// blogs/dto/update-blog.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateBlogDto } from "./create-blog.dto";

export class UpdateBlogDto {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  content?: string;
  subCategoryId?: string;
  userId?: string;
  image?: string;
  mediaType?: "image" | "video" | null;
  titleImage?: string;
}
