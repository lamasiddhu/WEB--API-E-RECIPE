import { ApplicationError } from "./application-error";

/** Kept for middleware/controller compatibility outside the application layer. */
export class HttpException extends ApplicationError {
    constructor(status: number, message: string) {
        super(status, message);
        this.name = "HttpException";
    }
}
