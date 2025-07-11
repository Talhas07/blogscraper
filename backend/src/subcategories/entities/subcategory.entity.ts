// subcategories/entities/subcategory.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Category } from "../../categories/entities/category.entity";
import { Blog } from "../../blogs/entities/blog.entity";

@Entity("subcategories")
export class Subcategory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    onDelete: "CASCADE",
  })
  category: Category;

  @OneToMany(() => Blog, (blog) => blog.subCategory, {
    onDelete: "CASCADE",
  })
  blogs: Blog[];
}
