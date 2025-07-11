// blogs/dto/create-blog.dto.ts
export class CreateBlogDto {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: string;
  subCategoryId: string; // UUID of the subcategory
  userId: string; // UUID of the user
  image?: string;
  mediaType?: "image" | "video" | null;
  titleImage?: string;
}
