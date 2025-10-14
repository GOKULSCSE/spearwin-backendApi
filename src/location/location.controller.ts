import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { LocationService } from './location.service';
import {
  CreateCountryDto,
  UpdateCountryDto,
  type CountryResponseDto,
} from './dto/country.dto';
import {
  CreateStateDto,
  UpdateStateDto,
  type StateResponseDto,
} from './dto/state.dto';
import {
  CreateCityDto,
  UpdateCityDto,
  type CityResponseDto,
  CitySearchQueryDto,
} from './dto/city.dto';
import {
  CreatePincodeDto,
  UpdatePincodeDto,
  type PincodeResponseDto,
} from './dto/pincode.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../company/guards/admin-role.guard';
import { SuperAdminRoleGuard } from '../company/guards/super-admin-role.guard';
import {
  GetCurrentUser,
  type CurrentUser,
} from '../auth/decorators/current-user.decorator';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // =================================================================
  // COUNTRY MANAGEMENT
  // =================================================================

  @Get('countries')
  async getAllCountries(): Promise<CountryResponseDto[]> {
    return this.locationService.getAllCountries();
  }

  @Get('countries/:id')
  async getCountryById(
    @Param('id') countryId: string,
  ): Promise<CountryResponseDto> {
    return this.locationService.getCountryById(countryId);
  }

  @Post('countries')
  @UseGuards(AdminRoleGuard)
  async createCountry(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) createDto: CreateCountryDto,
  ): Promise<CountryResponseDto> {
    return this.locationService.createCountry(createDto, user.id);
  }

  @Put('countries/:id')
  @UseGuards(AdminRoleGuard)
  async updateCountry(
    @Param('id') countryId: string,
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) updateDto: UpdateCountryDto,
  ): Promise<CountryResponseDto> {
    return this.locationService.updateCountry(countryId, updateDto, user.id);
  }

  @Delete('countries/:id')
  @UseGuards(SuperAdminRoleGuard)
  async deleteCountry(
    @Param('id') countryId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ message: string }> {
    return this.locationService.deleteCountry(countryId, user.id);
  }

  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  @Get('countries/:countryId/states')
  async getStatesByCountry(
    @Param('countryId') countryId: string,
  ): Promise<StateResponseDto[]> {
    return this.locationService.getStatesByCountry(countryId);
  }

  @Get('states/:id')
  async getStateById(@Param('id') stateId: string): Promise<StateResponseDto> {
    return this.locationService.getStateById(stateId);
  }

  @Post('states')
  @UseGuards(AdminRoleGuard)
  async createState(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) createDto: CreateStateDto,
  ): Promise<StateResponseDto> {
    return this.locationService.createState(createDto, user.id);
  }

  @Put('states/:id')
  @UseGuards(AdminRoleGuard)
  async updateState(
    @Param('id') stateId: string,
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) updateDto: UpdateStateDto,
  ): Promise<StateResponseDto> {
    return this.locationService.updateState(stateId, updateDto, user.id);
  }

  @Delete('states/:id')
  @UseGuards(SuperAdminRoleGuard)
  async deleteState(
    @Param('id') stateId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ message: string }> {
    return this.locationService.deleteState(stateId, user.id);
  }

  // =================================================================
  // CITY MANAGEMENT
  // =================================================================

  @Get('states/:stateId/cities')
  async getCitiesByState(
    @Param('stateId') stateId: string,
  ): Promise<CityResponseDto[]> {
    return this.locationService.getCitiesByState(stateId);
  }

  @Get('cities/:id')
  async getCityById(@Param('id') cityId: string): Promise<CityResponseDto> {
    return this.locationService.getCityById(cityId);
  }

  @Post('cities')
  @UseGuards(AdminRoleGuard)
  async createCity(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) createDto: CreateCityDto,
  ): Promise<CityResponseDto> {
    return this.locationService.createCity(createDto, user.id);
  }

  @Put('cities/:id')
  @UseGuards(AdminRoleGuard)
  async updateCity(
    @Param('id') cityId: string,
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) updateDto: UpdateCityDto,
  ): Promise<CityResponseDto> {
    return this.locationService.updateCity(cityId, updateDto, user.id);
  }

  @Delete('cities/:id')
  @UseGuards(SuperAdminRoleGuard)
  async deleteCity(
    @Param('id') cityId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ message: string }> {
    return this.locationService.deleteCity(cityId, user.id);
  }

  @Get('cities/search')
  async searchCities(
    @Query(ValidationPipe) query: CitySearchQueryDto,
  ): Promise<CityResponseDto[]> {
    return this.locationService.searchCities(query);
  }

  // =================================================================
  // PINCODE MANAGEMENT
  // =================================================================

  @Get('cities/:cityId/pincodes')
  async getPincodesByCity(
    @Param('cityId') cityId: string,
  ): Promise<PincodeResponseDto[]> {
    return this.locationService.getPincodesByCity(cityId);
  }

  @Get('pincodes/:id')
  async getPincodeById(
    @Param('id') pincodeId: string,
  ): Promise<PincodeResponseDto> {
    return this.locationService.getPincodeById(pincodeId);
  }

  @Post('pincodes')
  @UseGuards(AdminRoleGuard)
  async createPincode(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) createDto: CreatePincodeDto,
  ): Promise<PincodeResponseDto> {
    return this.locationService.createPincode(createDto, user.id);
  }

  @Put('pincodes/:id')
  @UseGuards(AdminRoleGuard)
  async updatePincode(
    @Param('id') pincodeId: string,
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) updateDto: UpdatePincodeDto,
  ): Promise<PincodeResponseDto> {
    return this.locationService.updatePincode(pincodeId, updateDto, user.id);
  }

  @Delete('pincodes/:id')
  @UseGuards(SuperAdminRoleGuard)
  async deletePincode(
    @Param('id') pincodeId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ message: string }> {
    return this.locationService.deletePincode(pincodeId, user.id);
  }
}
