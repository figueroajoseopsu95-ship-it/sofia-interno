import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dtos/api-response.dto';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
        return next.handle().pipe(
            map(data => {
                // Si el controlador ya devolvió un objeto ApiResponseDto, no lo envuelvas de nuevo
                if (data && typeof data === 'object' && 'success' in data && 'timestamp' in data) {
                    return data as ApiResponseDto<T>;
                }

                const isPaginated = data && data.meta && data.data;

                if (isPaginated) {
                    return new ApiResponseDto<T>(true, data.data, data.meta);
                }

                return new ApiResponseDto<T>(true, data);
            }),
        );
    }
}
