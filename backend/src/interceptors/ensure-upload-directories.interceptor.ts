import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UploadConfig } from '../config/upload.config';

/**
 * Interceptor that ensures upload directories exist before handling file uploads
 * This provides an extra safety net for file upload endpoints
 */
@Injectable()
export class EnsureUploadDirectoriesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Ensure directories exist before processing the request
    UploadConfig.ensureUploadDirectoriesExist();
    
    return next.handle();
  }
}
