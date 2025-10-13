export declare class CreateCountryDto {
    name: string;
    code: string;
    isActive?: boolean;
}
export declare class UpdateCountryDto {
    name?: string;
    code?: string;
    isActive?: boolean;
}
export declare class CountryResponseDto {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    states?: {
        id: string;
        name: string;
        code?: string | null;
        countryId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[];
}
