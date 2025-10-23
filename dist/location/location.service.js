"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let LocationService = class LocationService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getAllCountries() {
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
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getCountryById(countryId) {
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
                throw new common_1.NotFoundException(`Country with ID ${countryId} not found`);
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
                    latitude: state.latitude,
                    longitude: state.longitude,
                    isActive: state.isActive,
                    createdAt: state.createdAt,
                    updatedAt: state.updatedAt,
                })),
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async createCountry(createDto, userId) {
        try {
            if (!createDto.name || createDto.name.trim().length < 2) {
                throw new common_1.BadRequestException('Country name is required and must be at least 2 characters');
            }
            const existingCountry = await this.db.country.findFirst({
                where: {
                    OR: [
                        { name: { equals: createDto.name.trim(), mode: 'insensitive' } },
                        ...(createDto.iso2 ? [{ iso2: createDto.iso2.toUpperCase() }] : []),
                        ...(createDto.iso3 ? [{ iso3: createDto.iso3.toUpperCase() }] : []),
                    ]
                }
            });
            if (existingCountry) {
                throw new common_1.BadRequestException(`Country already exists with name "${existingCountry.name}" or matching ISO codes`);
            }
            const lastCountry = await this.db.country.findFirst({
                orderBy: { id: 'desc' },
                select: { id: true }
            });
            const nextId = lastCountry ? lastCountry.id + 1 : 1;
            const country = await this.db.country.create({
                data: {
                    id: nextId,
                    name: createDto.name.trim(),
                    iso3: createDto.iso3?.trim().toUpperCase() || null,
                    iso2: createDto.iso2?.trim().toUpperCase() || null,
                    numeric_code: createDto.numeric_code?.trim() || null,
                    phonecode: createDto.phonecode?.trim() || null,
                    capital: createDto.capital?.trim() || null,
                    currency: createDto.currency?.trim() || null,
                    currency_name: createDto.currency_name?.trim() || null,
                    currency_symbol: createDto.currency_symbol?.trim() || null,
                    tld: createDto.tld?.trim() || null,
                    native: createDto.native?.trim() || null,
                    region: createDto.region?.trim() || null,
                    region_id: createDto.region_id || null,
                    subregion: createDto.subregion?.trim() || null,
                    subregion_id: createDto.subregion_id || null,
                    nationality: createDto.nationality?.trim() || null,
                    latitude: createDto.latitude?.trim() || null,
                    longitude: createDto.longitude?.trim() || null,
                    isActive: createDto.isActive ?? true,
                },
            });
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
            };
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async updateCountry(countryId, updateDto, userId) {
        try {
            throw new common_1.BadRequestException('Country updates not supported - use imported data');
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async deleteCountry(countryId, userId) {
        try {
            throw new common_1.BadRequestException('Country deletion not supported - use imported data');
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getAllStates(query) {
        try {
            const limit = query.limit || 10;
            const offset = query.offset || 0;
            const search = query.search?.trim();
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { country_name: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (query.countryId) {
                where.country_id = query.countryId;
            }
            const [total, states] = await Promise.all([
                this.db.state.count({ where }),
                this.db.state.findMany({
                    where,
                    include: {
                        country: true,
                    },
                    orderBy: { [sortBy]: sortOrder },
                    skip: offset,
                    take: limit,
                }),
            ]);
            return {
                states: states.map((state) => ({
                    id: state.id,
                    name: state.name,
                    country_id: state.country_id,
                    country_code: state.country_code,
                    country_name: state.country_name,
                    iso2: state.iso2,
                    fips_code: state.fips_code,
                    type: state.type,
                    latitude: state.latitude,
                    longitude: state.longitude,
                    isActive: state.isActive,
                    createdAt: state.createdAt,
                    updatedAt: state.updatedAt,
                })),
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            };
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getStatesByCountry(countryId) {
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
                latitude: state.latitude,
                longitude: state.longitude,
                isActive: state.isActive,
                createdAt: state.createdAt,
                updatedAt: state.updatedAt,
            }));
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getStateById(stateId) {
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
                throw new common_1.NotFoundException(`State with ID ${stateId} not found`);
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
                latitude: state.latitude,
                longitude: state.longitude,
                isActive: state.isActive,
                createdAt: state.createdAt,
                updatedAt: state.updatedAt,
                country: state.country
                    ? {
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
                    }
                    : undefined,
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async createState(createDto, userId) {
        try {
            if (!createDto.name || createDto.name.trim().length < 2) {
                throw new common_1.BadRequestException('State name is required and must be at least 2 characters');
            }
            if (!createDto.countryId) {
                throw new common_1.BadRequestException('Country ID is required');
            }
            const country = await this.db.country.findUnique({
                where: { id: createDto.countryId }
            });
            if (!country) {
                throw new common_1.NotFoundException('Country not found');
            }
            const existingState = await this.db.state.findFirst({
                where: {
                    name: { equals: createDto.name.trim(), mode: 'insensitive' },
                    country_id: createDto.countryId
                }
            });
            if (existingState) {
                throw new common_1.BadRequestException(`State already exists with name "${existingState.name}" in this country`);
            }
            let nextId = 1;
            try {
                const lastState = await this.db.state.findFirst({
                    orderBy: { id: 'desc' },
                    select: { id: true }
                });
                if (lastState) {
                    nextId = lastState.id + 1;
                }
            }
            catch (error) {
                console.warn('Could not get last state ID, using 1:', error);
                nextId = 1;
            }
            const state = await this.db.state.create({
                data: {
                    id: nextId,
                    name: createDto.name.trim(),
                    country_id: createDto.countryId,
                    country_code: createDto.code?.trim() || null,
                    country_name: country.name,
                    isActive: createDto.isActive ?? true,
                },
            });
            return {
                id: state.id,
                name: state.name,
                country_id: state.country_id,
                country_code: state.country_code,
                country_name: state.country_name,
                iso2: state.iso2,
                fips_code: state.fips_code,
                type: state.type,
                latitude: state.latitude,
                longitude: state.longitude,
                isActive: state.isActive,
                createdAt: state.createdAt,
                updatedAt: state.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.error('State creation error:', error);
            if (error.code === 'P2002') {
                throw new common_1.BadRequestException('State with this name already exists in this country');
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateState(stateId, updateDto, userId) {
        try {
            throw new common_1.BadRequestException('State updates not supported - use imported data');
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getAllCities() {
        try {
            const cities = await this.db.city.findMany({
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
                state: city.state ? {
                    id: city.state.id,
                    name: city.state.name,
                    country_id: city.state.country_id,
                    country_code: city.state.country_code,
                    country_name: city.state.country_name,
                    iso2: city.state.iso2,
                    fips_code: city.state.fips_code,
                    type: city.state.type,
                    latitude: city.state.latitude,
                    longitude: city.state.longitude,
                    isActive: city.state.isActive,
                    createdAt: city.state.createdAt,
                    updatedAt: city.state.updatedAt,
                    country: city.state.country
                        ? {
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
                        }
                        : undefined,
                } : undefined,
                pincodes: city.pincodes.map((pincode) => ({
                    id: pincode.id,
                    code: pincode.code,
                    area: pincode.area,
                    cityId: pincode.cityId,
                    isActive: pincode.isActive,
                    createdAt: pincode.createdAt,
                    updatedAt: pincode.updatedAt,
                })),
            }));
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async deleteState(stateId, userId) {
        try {
            throw new common_1.BadRequestException('State deletion not supported - use imported data');
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getCitiesByState(stateId) {
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
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getCityById(cityId) {
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
                throw new common_1.NotFoundException(`City with ID ${cityId} not found`);
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
                    latitude: city.state.latitude,
                    longitude: city.state.longitude,
                    isActive: city.state.isActive,
                    createdAt: city.state.createdAt,
                    updatedAt: city.state.updatedAt,
                    country: city.state.country
                        ? {
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
                        }
                        : undefined,
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async searchCities(query) {
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
                    latitude: city.state.latitude,
                    longitude: city.state.longitude,
                    isActive: city.state.isActive,
                    createdAt: city.state.createdAt,
                    updatedAt: city.state.updatedAt,
                    country: city.state.country
                        ? {
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
                        }
                        : undefined,
                },
            }));
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async createCity(createDto, userId) {
        try {
            if (!createDto.name || createDto.name.trim().length < 2) {
                throw new common_1.BadRequestException('City name is required and must be at least 2 characters');
            }
            if (!createDto.stateId) {
                throw new common_1.BadRequestException('State ID is required');
            }
            const state = await this.db.state.findUnique({
                where: { id: createDto.stateId },
                include: { country: true }
            });
            if (!state) {
                throw new common_1.NotFoundException('State not found');
            }
            const existingCity = await this.db.city.findFirst({
                where: {
                    name: { equals: createDto.name.trim(), mode: 'insensitive' },
                    state_id: createDto.stateId
                }
            });
            if (existingCity) {
                throw new common_1.BadRequestException(`City already exists with name "${existingCity.name}" in this state`);
            }
            let nextId = 1;
            try {
                const lastCity = await this.db.city.findFirst({
                    orderBy: { id: 'desc' },
                    select: { id: true }
                });
                if (lastCity) {
                    nextId = lastCity.id + 1;
                }
            }
            catch (error) {
                console.warn('Could not get last city ID, using 1:', error);
                nextId = 1;
            }
            const city = await this.db.city.create({
                data: {
                    id: nextId,
                    name: createDto.name.trim(),
                    state_id: createDto.stateId,
                    state_name: state.name,
                    country_id: state.country_id,
                    country_name: state.country?.name,
                    isActive: createDto.isActive ?? true,
                },
            });
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
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.error('City creation error:', error);
            if (error.code === 'P2002') {
                throw new common_1.BadRequestException('City with this name already exists in this state');
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateCity(cityId, updateDto, userId) {
        try {
            throw new common_1.BadRequestException('City updates not supported - use imported data');
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async deleteCity(cityId, userId) {
        try {
            throw new common_1.BadRequestException('City deletion not supported - use imported data');
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getPincodesByCity(cityId) {
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
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getPincodeById(pincodeId) {
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
                throw new common_1.NotFoundException(`Pincode with ID ${pincodeId} not found`);
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
                        latitude: pincode.city.state.latitude,
                        longitude: pincode.city.state.longitude,
                        isActive: pincode.city.state.isActive,
                        createdAt: pincode.city.state.createdAt,
                        country: pincode.city.state.country
                            ? {
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
                            }
                            : undefined,
                    },
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async createPincode(createDto, userId) {
        try {
            throw new common_1.BadRequestException('Pincode creation not supported - use imported data');
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async updatePincode(pincodeId, updateDto, userId) {
        try {
            throw new common_1.BadRequestException('Pincode updates not supported - use imported data');
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async deletePincode(pincodeId, userId) {
        try {
            throw new common_1.BadRequestException('Pincode deletion not supported - use imported data');
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    handleException(error) {
        if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
            throw error;
        }
        console.error('Location Service Error:', error);
        throw new common_1.InternalServerErrorException('An unexpected error occurred');
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], LocationService);
//# sourceMappingURL=location.service.js.map