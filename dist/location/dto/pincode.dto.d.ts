export declare class CreatePincodeDto {
    code: string;
    area?: string;
    cityId: string;
    isActive?: boolean;
}
export declare class UpdatePincodeDto {
    code?: string;
    area?: string;
    cityId?: string;
    isActive?: boolean;
}
export declare class PincodeResponseDto {
    id: string;
    code: string;
    area?: string | null;
    cityId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    city?: {
        id: string;
        name: string;
        state: {
            id: string;
            name: string;
            code?: string | null;
            country: {
                id: string;
                name: string;
                code: string;
            };
        };
    };
}
