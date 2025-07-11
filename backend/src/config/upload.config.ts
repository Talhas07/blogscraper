import * as fs from "fs";
import * as path from "path";

export class UploadConfig {
  private static readonly UPLOAD_DIRECTORIES = [
    "./uploads",
    "./uploads/blogs", 
    "./uploads/blogs/editor",
    "./uploads/blogs/content",
    "./uploads/blogs/featured",
    "./uploads/blogs/featured-media",
    "./uploads/blogs/inline",
    "./uploads/blogs/title",
    "./uploads/blogs/title-images",
    "./uploads/avatars",
    "./uploads/media"
  ];

  /**
   * Ensures all required upload directories exist
   * Creates them recursively if they don't exist
   */
  static ensureUploadDirectoriesExist(): void {
    for (const dir of this.UPLOAD_DIRECTORIES) {
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`✅ Created upload directory: ${dir}`);
        } catch (error) {
          console.error(`❌ Failed to create directory ${dir}:`, error);
        }
      }
    }
  }

  /**
   * Ensures a specific directory exists
   * @param dirPath - The directory path to create
   */
  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dirPath}`);
      } catch (error) {
        console.error(`❌ Failed to create directory ${dirPath}:`, error);
      }
    }
  }

  /**
   * Get the list of all upload directories
   */
  static getUploadDirectories(): string[] {
    return [...this.UPLOAD_DIRECTORIES];
  }
}
