import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Exclude } from "class-transformer";
import { Blog } from "../../blogs/entities/blog.entity";
import { Follow } from "../../follows/entities/follow.entity";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  CLIENT = "client",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string; // Changed from number to string to match UUID format

  @Column({ nullable: true })
  firstName: string;
  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;
  @Column({ nullable: true })
  isActive: boolean;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => Blog, (blog) => blog.user)
  blogs: Blog[];

  @OneToMany(() => Follow, (follow) => follow.followedBy)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.followTo)
  followers: Follow[];

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  type: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
