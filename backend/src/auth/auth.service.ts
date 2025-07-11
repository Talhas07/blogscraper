import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
  async register(user: any) {
    if (Array.isArray(user)) {
      throw new BadRequestException("Cannot register multiple users at once");
    }

    const foundUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (foundUser) {
      throw new BadRequestException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = this.userRepository.create({
      ...user,
      password: hashedPassword,
      avatar: user.avatarPath || null, // save the uploaded file path
    });

    let savedUser: any;
    try {
      savedUser = await this.userRepository.save(newUser);
    } catch (error) {
      console.error("User save error:", error);
      throw new InternalServerErrorException("Failed to create user");
    }

    const payload = { email: savedUser.email, sub: savedUser.id };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        avatar: savedUser.avatar, // include avatar in the response
        type: savedUser.type,
      },
    };
  }

  async login(credentials: any) {
    const user = await this.validateUser(
      credentials.email,
      credentials.password
    );
    console.log("User found:", user);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      email: user.email,
      sub: user.id,
      type: user.type,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        type: user.type,
        isAdmin: user.isAdmin,
        avatar: user.avatar, // include avatar in the response
      },
    };
  }

  async refreshToken(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
