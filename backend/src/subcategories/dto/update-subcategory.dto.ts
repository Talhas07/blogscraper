// subcategories/dto/update-subcategory.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateSubcategoryDto } from "./create-subcategory.dto";

export class UpdateSubcategoryDto extends PartialType(CreateSubcategoryDto) {}
