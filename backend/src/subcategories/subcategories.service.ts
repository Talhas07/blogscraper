import { Injectable } from "@nestjs/common";
import { CreateSubcategoryDto } from "./dto/create-subcategory.dto";
import { UpdateSubcategoryDto } from "./dto/update-subcategory.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Subcategory } from "./entities/subcategory.entity";
import { Category } from "src/categories/entities/category.entity";
import { Repository } from "typeorm";

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory) private subRepo: Repository<Subcategory>,
    @InjectRepository(Category) private catRepo: Repository<Category>
  ) {}

  async create(dto: CreateSubcategoryDto) {
    const category = await this.catRepo.findOneBy({ id: dto.categoryId });
    const subcategory = this.subRepo.create({
      name: dto.name,
      isActive: dto.isActive,
      category,
    });
    return this.subRepo.save(subcategory);
  }

  findAll() {
    return this.subRepo.find({ relations: ["category"] });
  }

  findOne(id: string) {
    return this.subRepo.findOne({ where: { id }, relations: ["category"] });
  }

  async update(id: string, dto: UpdateSubcategoryDto) {
    const sub = await this.subRepo.findOneBy({ id });
    if (dto.categoryId) {
      sub.category = await this.catRepo.findOneBy({ id: dto.categoryId });
    }
    Object.assign(sub, dto);
    return this.subRepo.save(sub);
  }

  remove(id: string) {
    return this.subRepo.delete(id);
  }
}
