export class ApiResponseDto<T> {
    success: boolean;
    data?: T;
    meta?: any;
    timestamp: string;

    constructor(success: boolean, data?: T, meta?: any) {
        this.success = success;
        if (data !== undefined) this.data = data;
        if (meta !== undefined) this.meta = meta;
        this.timestamp = new Date().toISOString();
    }
}
