export declare class CreateAdminDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
    department?: string;
    position?: string;
}
