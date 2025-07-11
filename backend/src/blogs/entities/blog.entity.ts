import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Subcategory } from "../../subcategories/entities/subcategory.entity";

@Entity("blogs")
export class Blog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  metaTitle: string;

  @Column({ nullable: true, type: "text" })
  metaDescription: string;

  @Column({ type: "text" })
  content: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true, type: "enum", enum: ["image", "video", null] })
  mediaType: "image" | "video" | null;

  @Column({ nullable: true })
  titleImage: string;

  @ManyToOne(() => User, (user) => user.blogs, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Subcategory, (subCategory) => subCategory.blogs, {
    eager: true,
    onDelete: "CASCADE",
  })
  subCategory: Subcategory;

  // Optional: direct category for easier filtering (denormalization)
  // @ManyToOne(() => Category)
  // category: Category;
}
