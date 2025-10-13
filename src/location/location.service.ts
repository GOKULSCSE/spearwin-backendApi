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
        code: country.code,
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
        where: { id: countryId },
        include: {
          states: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
      });

      if (!country) {
        throw new NotFoundException('Country not found');
      }

      return {
        id: country.id,
        name: country.name,
        code: country.code,
        isActive: country.isActive,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
        states: country.states.map((state) => ({
          id: state.id,
          name: state.name,
          code: state.code,
          countryId: state.countryId,
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
      // Check if country with same name or code already exists
      const existingCountry = await this.db.country.findFirst({
        where: {
          OR: [{ name: createDto.name }, { code: createDto.code }],
        },
      });

      if (existingCountry) {
        throw new BadRequestException(
          'Country with this name or code already exists',
        );
      }

      const country = await this.db.country.create({
        data: createDto,
      });

      // Log the country creation
      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'Country',
        country.id,
        `Country created: ${country.name}`,
      );

      return {
        id: country.id,
        name: country.name,
        code: country.code,
        isActive: country.isActive,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
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
      const country = await this.db.country.findUnique({
        where: { id: countryId },
      });

      if (!country) {
        throw new NotFoundException('Country not found');
      }

      // Check if name or code is being changed and if it already exists
      if (updateDto.name && updateDto.name !== country.name) {
        const existingCountry = await this.db.country.findFirst({
          where: {
            name: updateDto.name,
            id: { not: countryId },
          },
        });

        if (existingCountry) {
          throw new BadRequestException(
            'Country with this name already exists',
          );
        }
      }

      if (updateDto.code && updateDto.code !== country.code) {
        const existingCountry = await this.db.country.findFirst({
          where: {
            code: updateDto.code,
            id: { not: countryId },
          },
        });

        if (existingCountry) {
          throw new BadRequestException(
            'Country with this code already exists',
          );
        }
      }

      const updatedCountry = await this.db.country.update({
        where: { id: countryId },
        data: updateDto,
      });

      // Log the country update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Country',
        countryId,
        `Country updated: ${updatedCountry.name}`,
      );

      return {
        id: updatedCountry.id,
        name: updatedCountry.name,
        code: updatedCountry.code,
        isActive: updatedCountry.isActive,
        createdAt: updatedCountry.createdAt,
        updatedAt: updatedCountry.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async deleteCountry(
    countryId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      const country = await this.db.country.findUnique({
        where: { id: countryId },
        include: {
          states: {
            include: {
              cities: true,
            },
          },
        },
      });

      if (!country) {
        throw new NotFoundException('Country not found');
      }

      // Check if country has states
      if (country.states.length > 0) {
        throw new BadRequestException(
          'Cannot delete country with existing states. Please delete all states first.',
        );
      }

      await this.db.country.delete({
        where: { id: countryId },
      });

      // Log the country deletion
      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.CRITICAL,
        'Country',
        countryId,
        `Country deleted: ${country.name}`,
      );

      return { message: 'Country deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  async getStatesByCountry(countryId: string): Promise<StateResponseDto[]> {
    try {
      const country = await this.db.country.findUnique({
        where: { id: countryId },
      });

      if (!country) {
        throw new NotFoundException('Country not found');
      }

      const states = await this.db.state.findMany({
        where: {
          countryId,
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });

      return states.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        countryId: state.countryId,
        isActive: state.isActive,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async getStateById(stateId: string): Promise<StateResponseDto> {
    try {
      const state = await this.db.state.findUnique({
        where: { id: stateId },
        include: {
          country: true,
          cities: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
      });

      if (!state) {
        throw new NotFoundException('State not found');
      }

      return {
        id: state.id,
        name: state.name,
        code: state.code,
        countryId: state.countryId,
        isActive: state.isActive,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        country: {
          id: state.country.id,
          name: state.country.name,
          code: state.country.code,
          isActive: state.country.isActive,
          createdAt: state.country.createdAt,
          updatedAt: state.country.updatedAt,
        },
        cities: state.cities.map((city) => ({
          id: city.id,
          name: city.name,
          stateId: city.stateId,
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
      // Check if country exists
      const country = await this.db.country.findUnique({
        where: { id: createDto.countryId },
      });

      if (!country) {
        throw new NotFoundException('Country not found');
      }

      // Check if state with same name already exists in the country
      const existingState = await this.db.state.findFirst({
        where: {
          name: createDto.name,
          countryId: createDto.countryId,
        },
      });

      if (existingState) {
        throw new BadRequestException(
          'State with this name already exists in the country',
        );
      }

      const state = await this.db.state.create({
        data: createDto,
      });

      // Log the state creation
      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'State',
        state.id,
        `State created: ${state.name} in ${country.name}`,
      );

      return {
        id: state.id,
        name: state.name,
        code: state.code,
        countryId: state.countryId,
        isActive: state.isActive,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
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
      const state = await this.db.state.findUnique({
        where: { id: stateId },
        include: { country: true },
      });

      if (!state) {
        throw new NotFoundException('State not found');
      }

      // Check if name is being changed and if it already exists in the country
      if (updateDto.name && updateDto.name !== state.name) {
        const existingState = await this.db.state.findFirst({
          where: {
            name: updateDto.name,
            countryId: updateDto.countryId || state.countryId,
            id: { not: stateId },
          },
        });

        if (existingState) {
          throw new BadRequestException(
            'State with this name already exists in the country',
          );
        }
      }

      const updatedState = await this.db.state.update({
        where: { id: stateId },
        data: updateDto,
      });

      // Log the state update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'State',
        stateId,
        `State updated: ${updatedState.name}`,
      );

      return {
        id: updatedState.id,
        name: updatedState.name,
        code: updatedState.code,
        countryId: updatedState.countryId,
        isActive: updatedState.isActive,
        createdAt: updatedState.createdAt,
        updatedAt: updatedState.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async deleteState(
    stateId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      const state = await this.db.state.findUnique({
        where: { id: stateId },
        include: {
          cities: true,
        },
      });

      if (!state) {
        throw new NotFoundException('State not found');
      }

      // Check if state has cities
      if (state.cities.length > 0) {
        throw new BadRequestException(
          'Cannot delete state with existing cities. Please delete all cities first.',
        );
      }

      await this.db.state.delete({
        where: { id: stateId },
      });

      // Log the state deletion
      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.CRITICAL,
        'State',
        stateId,
        `State deleted: ${state.name}`,
      );

      return { message: 'State deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // CITY MANAGEMENT
  // =================================================================

  async getCitiesByState(stateId: string): Promise<CityResponseDto[]> {
    try {
      const state = await this.db.state.findUnique({
        where: { id: stateId },
      });

      if (!state) {
        throw new NotFoundException('State not found');
      }

      const cities = await this.db.city.findMany({
        where: {
          stateId,
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });

      return cities.map((city) => ({
        id: city.id,
        name: city.name,
        stateId: city.stateId,
        isActive: city.isActive,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async getCityById(cityId: string): Promise<CityResponseDto> {
    try {
      const city = await this.db.city.findUnique({
        where: { id: cityId },
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
        throw new NotFoundException('City not found');
      }

      return {
        id: city.id,
        name: city.name,
        stateId: city.stateId,
        isActive: city.isActive,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
        state: {
          id: city.state.id,
          name: city.state.name,
          code: city.state.code,
          country: {
            id: city.state.country.id,
            name: city.state.country.name,
            code: city.state.country.code,
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

  async createCity(
    createDto: CreateCityDto,
    userId: string,
  ): Promise<CityResponseDto> {
    try {
      // Check if state exists
      const state = await this.db.state.findUnique({
        where: { id: createDto.stateId },
      });

      if (!state) {
        throw new NotFoundException('State not found');
      }

      // Check if city with same name already exists in the state
      const existingCity = await this.db.city.findFirst({
        where: {
          name: createDto.name,
          stateId: createDto.stateId,
        },
      });

      if (existingCity) {
        throw new BadRequestException(
          'City with this name already exists in the state',
        );
      }

      const city = await this.db.city.create({
        data: createDto,
      });

      // Log the city creation
      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'City',
        city.id,
        `City created: ${city.name} in ${state.name}`,
      );

      return {
        id: city.id,
        name: city.name,
        stateId: city.stateId,
        isActive: city.isActive,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
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
      const city = await this.db.city.findUnique({
        where: { id: cityId },
        include: { state: true },
      });

      if (!city) {
        throw new NotFoundException('City not found');
      }

      // Check if name is being changed and if it already exists in the state
      if (updateDto.name && updateDto.name !== city.name) {
        const existingCity = await this.db.city.findFirst({
          where: {
            name: updateDto.name,
            stateId: updateDto.stateId || city.stateId,
            id: { not: cityId },
          },
        });

        if (existingCity) {
          throw new BadRequestException(
            'City with this name already exists in the state',
          );
        }
      }

      const updatedCity = await this.db.city.update({
        where: { id: cityId },
        data: updateDto,
      });

      // Log the city update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'City',
        cityId,
        `City updated: ${updatedCity.name}`,
      );

      return {
        id: updatedCity.id,
        name: updatedCity.name,
        stateId: updatedCity.stateId,
        isActive: updatedCity.isActive,
        createdAt: updatedCity.createdAt,
        updatedAt: updatedCity.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async deleteCity(
    cityId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      const city = await this.db.city.findUnique({
        where: { id: cityId },
        include: {
          pincodes: true,
        },
      });

      if (!city) {
        throw new NotFoundException('City not found');
      }

      // Check if city has pincodes
      if (city.pincodes.length > 0) {
        throw new BadRequestException(
          'Cannot delete city with existing pincodes. Please delete all pincodes first.',
        );
      }

      await this.db.city.delete({
        where: { id: cityId },
      });

      // Log the city deletion
      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.CRITICAL,
        'City',
        cityId,
        `City deleted: ${city.name}`,
      );

      return { message: 'City deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async searchCities(query: CitySearchQueryDto): Promise<CityResponseDto[]> {
    try {
      const { search, stateId, countryId } = query;

      const whereClause: any = { isActive: true };

      if (search) {
        whereClause.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      if (stateId) {
        whereClause.stateId = stateId;
      }

      if (countryId) {
        whereClause.state = {
          countryId: countryId,
        };
      }

      const cities = await this.db.city.findMany({
        where: whereClause,
        include: {
          state: {
            include: {
              country: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        take: 50, // Limit results
      });

      return cities.map((city) => ({
        id: city.id,
        name: city.name,
        stateId: city.stateId,
        isActive: city.isActive,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
        state: {
          id: city.state.id,
          name: city.state.name,
          code: city.state.code,
          country: {
            id: city.state.country.id,
            name: city.state.country.name,
            code: city.state.country.code,
          },
        },
      }));
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
      const city = await this.db.city.findUnique({
        where: { id: cityId },
      });

      if (!city) {
        throw new NotFoundException('City not found');
      }

      const pincodes = await this.db.pincode.findMany({
        where: {
          cityId,
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
      if (error instanceof NotFoundException) {
        throw error;
      }
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
        throw new NotFoundException('Pincode not found');
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
          state: {
            id: pincode.city.state.id,
            name: pincode.city.state.name,
            code: pincode.city.state.code,
            country: {
              id: pincode.city.state.country.id,
              name: pincode.city.state.country.name,
              code: pincode.city.state.country.code,
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
      // Check if city exists
      const city = await this.db.city.findUnique({
        where: { id: createDto.cityId },
      });

      if (!city) {
        throw new NotFoundException('City not found');
      }

      // Check if pincode with same code already exists in the city
      const existingPincode = await this.db.pincode.findFirst({
        where: {
          code: createDto.code,
          cityId: createDto.cityId,
        },
      });

      if (existingPincode) {
        throw new BadRequestException(
          'Pincode with this code already exists in the city',
        );
      }

      const pincode = await this.db.pincode.create({
        data: createDto,
      });

      // Log the pincode creation
      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'Pincode',
        pincode.id,
        `Pincode created: ${pincode.code} in ${city.name}`,
      );

      return {
        id: pincode.id,
        code: pincode.code,
        area: pincode.area,
        cityId: pincode.cityId,
        isActive: pincode.isActive,
        createdAt: pincode.createdAt,
        updatedAt: pincode.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
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
      const pincode = await this.db.pincode.findUnique({
        where: { id: pincodeId },
        include: { city: true },
      });

      if (!pincode) {
        throw new NotFoundException('Pincode not found');
      }

      // Check if code is being changed and if it already exists in the city
      if (updateDto.code && updateDto.code !== pincode.code) {
        const existingPincode = await this.db.pincode.findFirst({
          where: {
            code: updateDto.code,
            cityId: updateDto.cityId || pincode.cityId,
            id: { not: pincodeId },
          },
        });

        if (existingPincode) {
          throw new BadRequestException(
            'Pincode with this code already exists in the city',
          );
        }
      }

      const updatedPincode = await this.db.pincode.update({
        where: { id: pincodeId },
        data: updateDto,
      });

      // Log the pincode update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Pincode',
        pincodeId,
        `Pincode updated: ${updatedPincode.code}`,
      );

      return {
        id: updatedPincode.id,
        code: updatedPincode.code,
        area: updatedPincode.area,
        cityId: updatedPincode.cityId,
        isActive: updatedPincode.isActive,
        createdAt: updatedPincode.createdAt,
        updatedAt: updatedPincode.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async deletePincode(
    pincodeId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      const pincode = await this.db.pincode.findUnique({
        where: { id: pincodeId },
      });

      if (!pincode) {
        throw new NotFoundException('Pincode not found');
      }

      await this.db.pincode.delete({
        where: { id: pincodeId },
      });

      // Log the pincode deletion
      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.CRITICAL,
        'Pincode',
        pincodeId,
        `Pincode deleted: ${pincode.code}`,
      );

      return { message: 'Pincode deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // HELPER METHODS
  // =================================================================

  private async logActivity(
    userId: string,
    action: LogAction,
    level: LogLevel,
    entity: string,
    entityId: string,
    description: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.db.activityLog.create({
        data: {
          userId,
          action,
          level,
          entity,
          entityId,
          description,
          metadata,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      // Don't throw error for logging failures
      console.error('Failed to log activity:', error);
    }
  }

  private handleException(error: any): void {
    throw new InternalServerErrorException("Can't process location request");
  }
}
