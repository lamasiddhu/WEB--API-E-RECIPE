/**
 * An application-layer failure. The `status` value is transport-neutral
 * metadata interpreted by the HTTP controllers without coupling use cases
 * to Express or an HTTP exception implementation.
 */
export class ApplicationError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = "ApplicationError";
    }
}
