export declare class CreateCityDto {
    name: string;
    stateId: string;
    isActive?: boolean;
}
export declare class UpdateCityDto {
    name?: string;
    stateId?: string;
    isActive?: boolean;
}
export declare class CityResponseDto {
    id: string;
    name: string;
    stateId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    state?: {
        id: string;
        name: string;
        code?: string | null;
        country: {
            id: string;
            name: string;
            code: string;
        };
    };
    pincodes?: {
        id: string;
        code: string;
        area?: string | null;
        cityId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[];
}
export declare class CitySearchQueryDto {
    search?: string;
    stateId?: string;
    countryId?: string;
}
