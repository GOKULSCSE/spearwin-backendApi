export declare class CreateStateDto {
    name: string;
    code?: string;
    countryId: number;
    isActive?: boolean;
}
export declare class UpdateStateDto {
    name?: string;
    code?: string;
    countryId?: number;
    isActive?: boolean;
}
export declare class StateListQueryDto {
    search?: string;
    countryId?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class StateResponseDto {
    id: number;
    name?: string | null;
    country_id?: number | null;
    state_id?: number | null;
    country_code?: string | null;
    country_name?: string | null;
    iso2?: string | null;
    fips_code?: string | null;
    type?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    country?: {
        id: number;
        name: string | null;
        iso3?: string | null;
        iso2?: string | null;
        numeric_code?: string | null;
        phonecode?: string | null;
        capital?: string | null;
        currency?: string | null;
        currency_name?: string | null;
        currency_symbol?: string | null;
        tld?: string | null;
        native?: string | null;
        region?: string | null;
        region_id?: number | null;
        subregion?: string | null;
        subregion_id?: number | null;
        nationality?: string | null;
        latitude?: string | null;
        longitude?: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
    cities?: {
        id: number;
        name: string;
        state_id: number;
        state_code?: string | null;
        state_name?: string | null;
        country_id?: number | null;
        country_code?: string | null;
        country_name?: string | null;
        latitude?: string | null;
        longitude?: string | null;
        wikiDataId?: string | null;
        isActive: boolean;
        createdAt: Date;
    }[];
}
export declare class StateListResponseDto {
    states: StateResponseDto[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}
