import { DatabaseService } from '../database/database.service';
import { CreateCountryDto, UpdateCountryDto, CountryResponseDto } from './dto/country.dto';
import { CreateStateDto, UpdateStateDto, StateResponseDto, StateListQueryDto, StateListResponseDto } from './dto/state.dto';
import { CreateCityDto, UpdateCityDto, CityResponseDto, CitySearchQueryDto, CityListQueryDto, CityListResponseDto } from './dto/city.dto';
import { CreatePincodeDto, UpdatePincodeDto, PincodeResponseDto } from './dto/pincode.dto';
export declare class LocationService {
    private readonly db;
    constructor(db: DatabaseService);
    getAllCountries(): Promise<CountryResponseDto[]>;
    getCountryById(countryId: string): Promise<CountryResponseDto>;
    createCountry(createDto: CreateCountryDto, userId: string): Promise<CountryResponseDto>;
    updateCountry(countryId: string, updateDto: UpdateCountryDto, userId: string): Promise<CountryResponseDto>;
    deleteCountry(countryId: string, userId: string): Promise<{
        message: string;
    }>;
    getAllStates(query: StateListQueryDto): Promise<StateListResponseDto>;
    getStatesByCountry(countryId: string): Promise<StateResponseDto[]>;
    getStateById(stateId: string): Promise<StateResponseDto>;
    createState(createDto: CreateStateDto, userId: string): Promise<StateResponseDto>;
    updateState(stateId: string, updateDto: UpdateStateDto, userId: string): Promise<StateResponseDto>;
    getAllCities(query: CityListQueryDto): Promise<CityListResponseDto>;
    deleteState(stateId: string, userId: string): Promise<{
        message: string;
    }>;
    getCitiesByState(stateId: string): Promise<CityResponseDto[]>;
    getCityById(cityId: string): Promise<CityResponseDto>;
    searchCities(query: CitySearchQueryDto): Promise<CityResponseDto[]>;
    createCity(createDto: CreateCityDto, userId: string): Promise<CityResponseDto>;
    updateCity(cityId: string, updateDto: UpdateCityDto, userId: string): Promise<CityResponseDto>;
    deleteCity(cityId: string, userId: string): Promise<{
        message: string;
    }>;
    getPincodesByCity(cityId: string): Promise<PincodeResponseDto[]>;
    getPincodeById(pincodeId: string): Promise<PincodeResponseDto>;
    createPincode(createDto: CreatePincodeDto, userId: string): Promise<PincodeResponseDto>;
    updatePincode(pincodeId: string, updateDto: UpdatePincodeDto, userId: string): Promise<PincodeResponseDto>;
    deletePincode(pincodeId: string, userId: string): Promise<{
        message: string;
    }>;
    private handleException;
}
