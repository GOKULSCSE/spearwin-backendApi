export declare class CreateStateDto {
    name: string;
    code?: string;
    countryId: string;
    isActive?: boolean;
}
export declare class UpdateStateDto {
    name?: string;
    code?: string;
    countryId?: string;
    isActive?: boolean;
}
export declare class StateResponseDto {
    id: string;
    name: string;
    code?: string | null;
    countryId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    country?: {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
    cities?: {
        id: string;
        name: string;
        stateId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[];
}
