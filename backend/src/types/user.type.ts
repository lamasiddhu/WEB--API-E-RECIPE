// Basic user shape used by models
export type UserType = {
    fullName: string;
    email: string;
    password: string;
    role?: "admin" | "user";
};
