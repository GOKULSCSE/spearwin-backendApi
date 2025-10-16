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
    id: number;
    name: string;
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
    states?: {
        id: number;
        name: string;
        country_id: number;
        country_code?: string | null;
        country_name?: string | null;
        iso2?: string | null;
        fips_code?: string | null;
        type?: string | null;
        level?: string | null;
        parent_id?: number | null;
        latitude?: string | null;
        longitude?: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[];
}
