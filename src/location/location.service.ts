import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateCountryDto,
  UpdateCountryDto,
  CountryResponseDto,
} from './dto/country.dto';
import {
  CreateStateDto,
  UpdateStateDto,
  StateResponseDto,
} from './dto/state.dto';
import {
  CreateCityDto,
  UpdateCityDto,
  CityResponseDto,
  CitySearchQueryDto,
} from './dto/city.dto';
import {
  CreatePincodeDto,
  UpdatePincodeDto,
  PincodeResponseDto,
} from './dto/pincode.dto';
import { LogAction, LogLevel } from '@prisma/client';

@Injectable()
export class LocationService {
  constructor(private readonly db: DatabaseService) {}

  // =================================================================
  // COUNTRY MANAGEMENT
  // =================================================================

  async getAllCountries(): Promise<CountryResponseDto[]> {
    try {
      const countries = await this.db.country.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });

      return countries.map((country) => ({
        id: country.id,
        name: country.name,
        iso3: country.iso3,
        iso2: country.iso2,
        numeric_code: country.numeric_code,
        phonecode: country.phonecode,
        capital: country.capital,
        currency: country.currency,
        currency_name: country.currency_name,
        currency_symbol: country.currency_symbol,
        tld: country.tld,
        native: country.native,
        region: country.region,
        region_id: country.region_id,
        subregion: country.subregion,
        subregion_id: country.subregion_id,
        nationality: country.nationality,
        latitude: country.latitude,
        longitude: country.longitude,
        isActive: country.isActive,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
      }));
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getCountryById(countryId: string): Promise<CountryResponseDto> {
    try {
      const country = await this.db.country.findUnique({
        where: { id: parseInt(countryId) },
        include: {
          states: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
      });

      if (!country) {
        throw new NotFoundException(`Country with ID ${countryId} not found`);
      }

      return {
        id: country.id,
        name: country.name,
        iso3: country.iso3,
        iso2: country.iso2,
        numeric_code: country.numeric_code,
        phonecode: country.phonecode,
        capital: country.capital,
        currency: country.currency,
        currency_name: country.currency_name,
        currency_symbol: country.currency_symbol,
        tld: country.tld,
        native: country.native,
        region: country.region,
        region_id: country.region_id,
        subregion: country.subregion,
        subregion_id: country.subregion_id,
        nationality: country.nationality,
        latitude: country.latitude,
        longitude: country.longitude,
        isActive: country.isActive,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
        states: country.states.map((state) => ({
          id: state.id,
          name: state.name,
          country_id: state.country_id,
          country_code: state.country_code,
          country_name: state.country_name,
          iso2: state.iso2,
          fips_code: state.fips_code,
          type: state.type,
          level: state.level,
          parent_id: state.parent_id,
          latitude: state.latitude,
          longitude: state.longitude,
          isActive: state.isActive,
          createdAt: state.createdAt,
          updatedAt: state.updatedAt,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async createCountry(
    createDto: CreateCountryDto,
    userId: string,
  ): Promise<CountryResponseDto> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('Country creation not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async updateCountry(
    countryId: string,
    updateDto: UpdateCountryDto,
    userId: string,
  ): Promise<CountryResponseDto> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('Country updates not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async deleteCountry(countryId: string, userId: string): Promise<{ message: string }> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('Country deletion not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  async getStatesByCountry(countryId: string): Promise<StateResponseDto[]> {
    try {
      const states = await this.db.state.findMany({
        where: {
          country_id: parseInt(countryId),
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });

      return states.map((state) => ({
        id: state.id,
        name: state.name,
        country_id: state.country_id,
        country_code: state.country_code,
        country_name: state.country_name,
        iso2: state.iso2,
        fips_code: state.fips_code,
        type: state.type,
        level: state.level,
        parent_id: state.parent_id,
        latitude: state.latitude,
        longitude: state.longitude,
        isActive: state.isActive,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      }));
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getStateById(stateId: string): Promise<StateResponseDto> {
    try {
      const state = await this.db.state.findUnique({
        where: { id: parseInt(stateId) },
        include: {
          country: true,
          cities: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
      });

      if (!state) {
        throw new NotFoundException(`State with ID ${stateId} not found`);
      }

      return {
        id: state.id,
        name: state.name,
        country_id: state.country_id,
        country_code: state.country_code,
        country_name: state.country_name,
        iso2: state.iso2,
        fips_code: state.fips_code,
        type: state.type,
        level: state.level,
        parent_id: state.parent_id,
        latitude: state.latitude,
        longitude: state.longitude,
        isActive: state.isActive,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        country: {
          id: state.country.id,
          name: state.country.name,
          iso3: state.country.iso3,
          iso2: state.country.iso2,
          numeric_code: state.country.numeric_code,
          phonecode: state.country.phonecode,
          capital: state.country.capital,
          currency: state.country.currency,
          currency_name: state.country.currency_name,
          currency_symbol: state.country.currency_symbol,
          tld: state.country.tld,
          native: state.country.native,
          region: state.country.region,
          region_id: state.country.region_id,
          subregion: state.country.subregion,
          subregion_id: state.country.subregion_id,
          nationality: state.country.nationality,
          latitude: state.country.latitude,
          longitude: state.country.longitude,
          isActive: state.country.isActive,
          createdAt: state.country.createdAt,
          updatedAt: state.country.updatedAt,
        },
        cities: state.cities.map((city) => ({
          id: city.id,
          name: city.name,
          state_id: city.state_id,
          state_code: city.state_code,
          state_name: city.state_name,
          country_id: city.country_id,
          country_code: city.country_code,
          country_name: city.country_name,
          latitude: city.latitude,
          longitude: city.longitude,
          wikiDataId: city.wikiDataId,
          isActive: city.isActive,
          createdAt: city.createdAt,
          updatedAt: city.updatedAt,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async createState(
    createDto: CreateStateDto,
    userId: string,
  ): Promise<StateResponseDto> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('State creation not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async updateState(
    stateId: string,
    updateDto: UpdateStateDto,
    userId: string,
  ): Promise<StateResponseDto> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('State updates not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async deleteState(stateId: string, userId: string): Promise<{ message: string }> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('State deletion not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // CITY MANAGEMENT
  // =================================================================

  async getCitiesByState(stateId: string): Promise<CityResponseDto[]> {
    try {
      const cities = await this.db.city.findMany({
        where: {
          state_id: parseInt(stateId),
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });

      return cities.map((city) => ({
        id: city.id,
        name: city.name,
        state_id: city.state_id,
        state_code: city.state_code,
        state_name: city.state_name,
        country_id: city.country_id,
        country_code: city.country_code,
        country_name: city.country_name,
        latitude: city.latitude,
        longitude: city.longitude,
        wikiDataId: city.wikiDataId,
        isActive: city.isActive,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
      }));
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getCityById(cityId: string): Promise<CityResponseDto> {
    try {
      const city = await this.db.city.findUnique({
        where: { id: parseInt(cityId) },
        include: {
          state: {
            include: {
              country: true,
            },
          },
          pincodes: {
            where: { isActive: true },
            orderBy: { code: 'asc' },
          },
        },
      });

      if (!city) {
        throw new NotFoundException(`City with ID ${cityId} not found`);
      }

      return {
        id: city.id,
        name: city.name,
        state_id: city.state_id,
        state_code: city.state_code,
        state_name: city.state_name,
        country_id: city.country_id,
        country_code: city.country_code,
        country_name: city.country_name,
        latitude: city.latitude,
        longitude: city.longitude,
        wikiDataId: city.wikiDataId,
        isActive: city.isActive,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
        state: {
          id: city.state.id,
          name: city.state.name,
          country_id: city.state.country_id,
          country_code: city.state.country_code,
          country_name: city.state.country_name,
          iso2: city.state.iso2,
          fips_code: city.state.fips_code,
          type: city.state.type,
          level: city.state.level,
          parent_id: city.state.parent_id,
          latitude: city.state.latitude,
          longitude: city.state.longitude,
          isActive: city.state.isActive,
          createdAt: city.state.createdAt,
          updatedAt: city.state.updatedAt,
          country: {
            id: city.state.country.id,
            name: city.state.country.name,
            iso3: city.state.country.iso3,
            iso2: city.state.country.iso2,
            numeric_code: city.state.country.numeric_code,
            phonecode: city.state.country.phonecode,
            capital: city.state.country.capital,
            currency: city.state.country.currency,
            currency_name: city.state.country.currency_name,
            currency_symbol: city.state.country.currency_symbol,
            tld: city.state.country.tld,
            native: city.state.country.native,
            region: city.state.country.region,
            region_id: city.state.country.region_id,
            subregion: city.state.country.subregion,
            subregion_id: city.state.country.subregion_id,
            nationality: city.state.country.nationality,
            latitude: city.state.country.latitude,
            longitude: city.state.country.longitude,
            isActive: city.state.country.isActive,
            createdAt: city.state.country.createdAt,
            updatedAt: city.state.country.updatedAt,
          },
        },
        pincodes: city.pincodes.map((pincode) => ({
          id: pincode.id,
          code: pincode.code,
          area: pincode.area,
          cityId: pincode.cityId,
          isActive: pincode.isActive,
          createdAt: pincode.createdAt,
          updatedAt: pincode.updatedAt,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async searchCities(query: CitySearchQueryDto): Promise<CityResponseDto[]> {
    try {
      const cities = await this.db.city.findMany({
        where: {
          name: {
            contains: query.search || '',
            mode: 'insensitive',
          },
          isActive: true,
        },
        include: {
          state: {
            include: {
              country: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        take: query.limit || 10,
      });

      return cities.map((city) => ({
        id: city.id,
        name: city.name,
        state_id: city.state_id,
        state_code: city.state_code,
        state_name: city.state_name,
        country_id: city.country_id,
        country_code: city.country_code,
        country_name: city.country_name,
        latitude: city.latitude,
        longitude: city.longitude,
        wikiDataId: city.wikiDataId,
        isActive: city.isActive,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
        state: {
          id: city.state.id,
          name: city.state.name,
          country_id: city.state.country_id,
          country_code: city.state.country_code,
          country_name: city.state.country_name,
          iso2: city.state.iso2,
          fips_code: city.state.fips_code,
          type: city.state.type,
          level: city.state.level,
          parent_id: city.state.parent_id,
          latitude: city.state.latitude,
          longitude: city.state.longitude,
          isActive: city.state.isActive,
          createdAt: city.state.createdAt,
          updatedAt: city.state.updatedAt,
          country: {
            id: city.state.country.id,
            name: city.state.country.name,
            iso3: city.state.country.iso3,
            iso2: city.state.country.iso2,
            numeric_code: city.state.country.numeric_code,
            phonecode: city.state.country.phonecode,
            capital: city.state.country.capital,
            currency: city.state.country.currency,
            currency_name: city.state.country.currency_name,
            currency_symbol: city.state.country.currency_symbol,
            tld: city.state.country.tld,
            native: city.state.country.native,
            region: city.state.country.region,
            region_id: city.state.country.region_id,
            subregion: city.state.country.subregion,
            subregion_id: city.state.country.subregion_id,
            nationality: city.state.country.nationality,
            latitude: city.state.country.latitude,
            longitude: city.state.country.longitude,
            isActive: city.state.country.isActive,
            createdAt: city.state.country.createdAt,
            updatedAt: city.state.country.updatedAt,
          },
        },
      }));
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async createCity(
    createDto: CreateCityDto,
    userId: string,
  ): Promise<CityResponseDto> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('City creation not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async updateCity(
    cityId: string,
    updateDto: UpdateCityDto,
    userId: string,
  ): Promise<CityResponseDto> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('City updates not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async deleteCity(cityId: string, userId: string): Promise<{ message: string }> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('City deletion not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // PINCODE MANAGEMENT
  // =================================================================

  async getPincodesByCity(cityId: string): Promise<PincodeResponseDto[]> {
    try {
      const pincodes = await this.db.pincode.findMany({
        where: {
          cityId: parseInt(cityId),
          isActive: true,
        },
        orderBy: { code: 'asc' },
      });

      return pincodes.map((pincode) => ({
        id: pincode.id,
        code: pincode.code,
        area: pincode.area,
        cityId: pincode.cityId,
        isActive: pincode.isActive,
        createdAt: pincode.createdAt,
        updatedAt: pincode.updatedAt,
      }));
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getPincodeById(pincodeId: string): Promise<PincodeResponseDto> {
    try {
      const pincode = await this.db.pincode.findUnique({
        where: { id: pincodeId },
        include: {
          city: {
            include: {
              state: {
                include: {
                  country: true,
                },
              },
            },
          },
        },
      });

      if (!pincode) {
        throw new NotFoundException(`Pincode with ID ${pincodeId} not found`);
      }

      return {
        id: pincode.id,
        code: pincode.code,
        area: pincode.area,
        cityId: pincode.cityId,
        isActive: pincode.isActive,
        createdAt: pincode.createdAt,
        updatedAt: pincode.updatedAt,
        city: {
          id: pincode.city.id,
          name: pincode.city.name,
          state_id: pincode.city.state_id,
          state_code: pincode.city.state_code,
          state_name: pincode.city.state_name,
          country_id: pincode.city.country_id,
          country_code: pincode.city.country_code,
          country_name: pincode.city.country_name,
          latitude: pincode.city.latitude,
          longitude: pincode.city.longitude,
          wikiDataId: pincode.city.wikiDataId,
          isActive: pincode.city.isActive,
          createdAt: pincode.city.createdAt,
          updatedAt: pincode.city.updatedAt,
          state: {
            id: pincode.city.state.id,
            name: pincode.city.state.name,
            country_id: pincode.city.state.country_id,
            country_code: pincode.city.state.country_code,
            country_name: pincode.city.state.country_name,
            iso2: pincode.city.state.iso2,
            fips_code: pincode.city.state.fips_code,
            type: pincode.city.state.type,
            level: pincode.city.state.level,
            parent_id: pincode.city.state.parent_id,
            latitude: pincode.city.state.latitude,
            longitude: pincode.city.state.longitude,
            isActive: pincode.city.state.isActive,
            createdAt: pincode.city.state.createdAt,
            updatedAt: pincode.city.state.updatedAt,
            country: {
              id: pincode.city.state.country.id,
              name: pincode.city.state.country.name,
              iso3: pincode.city.state.country.iso3,
              iso2: pincode.city.state.country.iso2,
              numeric_code: pincode.city.state.country.numeric_code,
              phonecode: pincode.city.state.country.phonecode,
              capital: pincode.city.state.country.capital,
              currency: pincode.city.state.country.currency,
              currency_name: pincode.city.state.country.currency_name,
              currency_symbol: pincode.city.state.country.currency_symbol,
              tld: pincode.city.state.country.tld,
              native: pincode.city.state.country.native,
              region: pincode.city.state.country.region,
              region_id: pincode.city.state.country.region_id,
              subregion: pincode.city.state.country.subregion,
              subregion_id: pincode.city.state.country.subregion_id,
              nationality: pincode.city.state.country.nationality,
              latitude: pincode.city.state.country.latitude,
              longitude: pincode.city.state.country.longitude,
              isActive: pincode.city.state.country.isActive,
              createdAt: pincode.city.state.country.createdAt,
              updatedAt: pincode.city.state.country.updatedAt,
            },
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async createPincode(
    createDto: CreatePincodeDto,
    userId: string,
  ): Promise<PincodeResponseDto> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('Pincode creation not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async updatePincode(
    pincodeId: string,
    updateDto: UpdatePincodeDto,
    userId: string,
  ): Promise<PincodeResponseDto> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('Pincode updates not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async deletePincode(pincodeId: string, userId: string): Promise<{ message: string }> {
    try {
      // For now, throw not implemented since we have comprehensive data
      throw new BadRequestException('Pincode deletion not supported - use imported data');
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // UTILITY METHODS
  // =================================================================

  private handleException(error: any): void {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }

    console.error('Location Service Error:', error);
    throw new InternalServerErrorException('An unexpected error occurred');
  }
}