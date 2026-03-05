import { ValidationPipe, ValidationError, BadRequestException } from '@nestjs/common';

export const GlobalValidationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
        }));
        return new BadRequestException({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request payload',
                details: formattedErrors,
            },
        });
    },
});
