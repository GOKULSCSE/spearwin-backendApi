import { LocationService } from './location.service';
import { CreateCountryDto, UpdateCountryDto, type CountryResponseDto } from './dto/country.dto';
import { CreateStateDto, UpdateStateDto, type StateResponseDto } from './dto/state.dto';
import { CreateCityDto, UpdateCityDto, type CityResponseDto, CitySearchQueryDto } from './dto/city.dto';
import { CreatePincodeDto, UpdatePincodeDto, type PincodeResponseDto } from './dto/pincode.dto';
import { type CurrentUser } from '../auth/decorators/current-user.decorator';
export declare class LocationController {
    private readonly locationService;
    constructor(locationService: LocationService);
    getAllCountries(): Promise<CountryResponseDto[]>;
    getCountryById(countryId: string): Promise<CountryResponseDto>;
    createCountry(user: CurrentUser, createDto: CreateCountryDto): Promise<CountryResponseDto>;
    updateCountry(countryId: string, user: CurrentUser, updateDto: UpdateCountryDto): Promise<CountryResponseDto>;
    deleteCountry(countryId: string, user: CurrentUser): Promise<{
        message: string;
    }>;
    getStatesByCountry(countryId: string): Promise<StateResponseDto[]>;
    getStateById(stateId: string): Promise<StateResponseDto>;
    createState(user: CurrentUser, createDto: CreateStateDto): Promise<StateResponseDto>;
    updateState(stateId: string, user: CurrentUser, updateDto: UpdateStateDto): Promise<StateResponseDto>;
    deleteState(stateId: string, user: CurrentUser): Promise<{
        message: string;
    }>;
    getCitiesByState(stateId: string): Promise<CityResponseDto[]>;
    getCityById(cityId: string): Promise<CityResponseDto>;
    createCity(user: CurrentUser, createDto: CreateCityDto): Promise<CityResponseDto>;
    updateCity(cityId: string, user: CurrentUser, updateDto: UpdateCityDto): Promise<CityResponseDto>;
    deleteCity(cityId: string, user: CurrentUser): Promise<{
        message: string;
    }>;
    searchCities(query: CitySearchQueryDto): Promise<CityResponseDto[]>;
    getPincodesByCity(cityId: string): Promise<PincodeResponseDto[]>;
    getPincodeById(pincodeId: string): Promise<PincodeResponseDto>;
    createPincode(user: CurrentUser, createDto: CreatePincodeDto): Promise<PincodeResponseDto>;
    updatePincode(pincodeId: string, user: CurrentUser, updateDto: UpdatePincodeDto): Promise<PincodeResponseDto>;
    deletePincode(pincodeId: string, user: CurrentUser): Promise<{
        message: string;
    }>;
}
