// subcategories/dto/create-subcategory.dto.ts
export class CreateSubcategoryDto {
  name: string;
  categoryId: string;
  isActive?: boolean;
}
