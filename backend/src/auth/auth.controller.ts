import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiBody } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { extname } from "path";
import { EnsureUploadDirectoriesInterceptor } from "../interceptors/ensure-upload-directories.interceptor";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("register")
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: diskStorage({
        destination: "./uploads/avatars", // or a desired path
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    })
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string", format: "email" },
        password: { type: "string" },
        avatar: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async register(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const imagePath = file ? `/uploads/avatars/${file.filename}` : null;
    return this.authService.register({
      ...body,
      avatarPath: imagePath, // Save file path or name
    });
  }
  // @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Request() req) {
    return this.authService.login(req.body);
  }

  @UseGuards(JwtAuthGuard)
  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user.id);
  }
}
