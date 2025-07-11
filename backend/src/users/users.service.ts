import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findByRole(role: string): Promise<User[]> {
    if (role === "all") {
      return this.userRepository.find({
        // relations: ["parent"],
      });
    }
    return this.userRepository.find({
      where: { type: role as UserRole },
      // relations: ["parent"],
    });
  }

  async create(createUserDto: any): Promise<any> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // If this is a client, we need to handle the parentId relationship
    if (createUserDto.type === "client" && createUserDto.assignedTo) {
      const parentUser = await this.userRepository.findOne({
        where: { id: createUserDto.assignedTo },
      });

      if (!parentUser) {
        throw new NotFoundException("Assigned user not found");
      }
      console.log("Parent User: ", parentUser);
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        parentId: parentUser.id, // Ensure parentId is explicitly set
      });

      return this.userRepository.save(user);
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      // select: ["id", "email", "name", "industry"], // Ensure 'industry' is selected
      // relations: ["parent", "clients"],
    });
  }

  async findOne(id: string): Promise<User> {
    // Changed id type to string
    const user = await this.userRepository.findOne({
      where: { id },
      // select: ["id", "email", "name", "industry"], // Ensure 'industry' is selected
      // relations: ["parent", "clients"],
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      // relations: ["parent", "clients"],
    });
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    // Changed id type to string
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // If this is a client update and assignedTo is changed
    if (updateUserDto.type === "client" && updateUserDto.assignedTo) {
      const parentUser = await this.userRepository.findOne({
        where: { id: updateUserDto.assignedTo },
      });

      if (!parentUser) {
        throw new NotFoundException("Assigned user not found");
      }

      updateUserDto.parentId = parentUser.id; // Set the parentId
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }
  async remove(id: string): Promise<{ id: string; affected: number }> {
    const result = await this.userRepository.delete(id);
    return { id, affected: result.affected ?? 0 };
  }
}
