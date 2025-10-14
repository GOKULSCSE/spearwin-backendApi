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
const client_1 = require("@prisma/client");
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
                code: country.code,
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
                where: { id: countryId },
                include: {
                    states: {
                        where: { isActive: true },
                        orderBy: { name: 'asc' },
                    },
                },
            });
            if (!country) {
                throw new common_1.NotFoundException('Country not found');
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
            const existingCountry = await this.db.country.findFirst({
                where: {
                    OR: [{ name: createDto.name }, { code: createDto.code }],
                },
            });
            if (existingCountry) {
                throw new common_1.BadRequestException('Country with this name or code already exists');
            }
            const country = await this.db.country.create({
                data: createDto,
            });
            await this.logActivity(userId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'Country', country.id, `Country created: ${country.name}`);
            return {
                id: country.id,
                name: country.name,
                code: country.code,
                isActive: country.isActive,
                createdAt: country.createdAt,
                updatedAt: country.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateCountry(countryId, updateDto, userId) {
        try {
            const country = await this.db.country.findUnique({
                where: { id: countryId },
            });
            if (!country) {
                throw new common_1.NotFoundException('Country not found');
            }
            if (updateDto.name && updateDto.name !== country.name) {
                const existingCountry = await this.db.country.findFirst({
                    where: {
                        name: updateDto.name,
                        id: { not: countryId },
                    },
                });
                if (existingCountry) {
                    throw new common_1.BadRequestException('Country with this name already exists');
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
                    throw new common_1.BadRequestException('Country with this code already exists');
                }
            }
            const updatedCountry = await this.db.country.update({
                where: { id: countryId },
                data: updateDto,
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Country', countryId, `Country updated: ${updatedCountry.name}`);
            return {
                id: updatedCountry.id,
                name: updatedCountry.name,
                code: updatedCountry.code,
                isActive: updatedCountry.isActive,
                createdAt: updatedCountry.createdAt,
                updatedAt: updatedCountry.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async deleteCountry(countryId, userId) {
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
                throw new common_1.NotFoundException('Country not found');
            }
            if (country.states.length > 0) {
                throw new common_1.BadRequestException('Cannot delete country with existing states. Please delete all states first.');
            }
            await this.db.country.delete({
                where: { id: countryId },
            });
            await this.logActivity(userId, client_1.LogAction.DELETE, client_1.LogLevel.CRITICAL, 'Country', countryId, `Country deleted: ${country.name}`);
            return { message: 'Country deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getStatesByCountry(countryId) {
        try {
            const country = await this.db.country.findUnique({
                where: { id: countryId },
            });
            if (!country) {
                throw new common_1.NotFoundException('Country not found');
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getStateById(stateId) {
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
                throw new common_1.NotFoundException('State not found');
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
            const country = await this.db.country.findUnique({
                where: { id: createDto.countryId },
            });
            if (!country) {
                throw new common_1.NotFoundException('Country not found');
            }
            const existingState = await this.db.state.findFirst({
                where: {
                    name: createDto.name,
                    countryId: createDto.countryId,
                },
            });
            if (existingState) {
                throw new common_1.BadRequestException('State with this name already exists in the country');
            }
            const state = await this.db.state.create({
                data: createDto,
            });
            await this.logActivity(userId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'State', state.id, `State created: ${state.name} in ${country.name}`);
            return {
                id: state.id,
                name: state.name,
                code: state.code,
                countryId: state.countryId,
                isActive: state.isActive,
                createdAt: state.createdAt,
                updatedAt: state.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateState(stateId, updateDto, userId) {
        try {
            const state = await this.db.state.findUnique({
                where: { id: stateId },
                include: { country: true },
            });
            if (!state) {
                throw new common_1.NotFoundException('State not found');
            }
            if (updateDto.name && updateDto.name !== state.name) {
                const existingState = await this.db.state.findFirst({
                    where: {
                        name: updateDto.name,
                        countryId: updateDto.countryId || state.countryId,
                        id: { not: stateId },
                    },
                });
                if (existingState) {
                    throw new common_1.BadRequestException('State with this name already exists in the country');
                }
            }
            const updatedState = await this.db.state.update({
                where: { id: stateId },
                data: updateDto,
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'State', stateId, `State updated: ${updatedState.name}`);
            return {
                id: updatedState.id,
                name: updatedState.name,
                code: updatedState.code,
                countryId: updatedState.countryId,
                isActive: updatedState.isActive,
                createdAt: updatedState.createdAt,
                updatedAt: updatedState.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async deleteState(stateId, userId) {
        try {
            const state = await this.db.state.findUnique({
                where: { id: stateId },
                include: {
                    cities: true,
                },
            });
            if (!state) {
                throw new common_1.NotFoundException('State not found');
            }
            if (state.cities.length > 0) {
                throw new common_1.BadRequestException('Cannot delete state with existing cities. Please delete all cities first.');
            }
            await this.db.state.delete({
                where: { id: stateId },
            });
            await this.logActivity(userId, client_1.LogAction.DELETE, client_1.LogLevel.CRITICAL, 'State', stateId, `State deleted: ${state.name}`);
            return { message: 'State deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getCitiesByState(stateId) {
        try {
            const state = await this.db.state.findUnique({
                where: { id: stateId },
            });
            if (!state) {
                throw new common_1.NotFoundException('State not found');
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getCityById(cityId) {
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
                throw new common_1.NotFoundException('City not found');
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async createCity(createDto, userId) {
        try {
            const state = await this.db.state.findUnique({
                where: { id: createDto.stateId },
            });
            if (!state) {
                throw new common_1.NotFoundException('State not found');
            }
            const existingCity = await this.db.city.findFirst({
                where: {
                    name: createDto.name,
                    stateId: createDto.stateId,
                },
            });
            if (existingCity) {
                throw new common_1.BadRequestException('City with this name already exists in the state');
            }
            const city = await this.db.city.create({
                data: createDto,
            });
            await this.logActivity(userId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'City', city.id, `City created: ${city.name} in ${state.name}`);
            return {
                id: city.id,
                name: city.name,
                stateId: city.stateId,
                isActive: city.isActive,
                createdAt: city.createdAt,
                updatedAt: city.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateCity(cityId, updateDto, userId) {
        try {
            const city = await this.db.city.findUnique({
                where: { id: cityId },
                include: { state: true },
            });
            if (!city) {
                throw new common_1.NotFoundException('City not found');
            }
            if (updateDto.name && updateDto.name !== city.name) {
                const existingCity = await this.db.city.findFirst({
                    where: {
                        name: updateDto.name,
                        stateId: updateDto.stateId || city.stateId,
                        id: { not: cityId },
                    },
                });
                if (existingCity) {
                    throw new common_1.BadRequestException('City with this name already exists in the state');
                }
            }
            const updatedCity = await this.db.city.update({
                where: { id: cityId },
                data: updateDto,
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'City', cityId, `City updated: ${updatedCity.name}`);
            return {
                id: updatedCity.id,
                name: updatedCity.name,
                stateId: updatedCity.stateId,
                isActive: updatedCity.isActive,
                createdAt: updatedCity.createdAt,
                updatedAt: updatedCity.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async deleteCity(cityId, userId) {
        try {
            const city = await this.db.city.findUnique({
                where: { id: cityId },
                include: {
                    pincodes: true,
                },
            });
            if (!city) {
                throw new common_1.NotFoundException('City not found');
            }
            if (city.pincodes.length > 0) {
                throw new common_1.BadRequestException('Cannot delete city with existing pincodes. Please delete all pincodes first.');
            }
            await this.db.city.delete({
                where: { id: cityId },
            });
            await this.logActivity(userId, client_1.LogAction.DELETE, client_1.LogLevel.CRITICAL, 'City', cityId, `City deleted: ${city.name}`);
            return { message: 'City deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async searchCities(query) {
        try {
            const { search, stateId, countryId } = query;
            const whereClause = { isActive: true };
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
                take: 50,
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
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getPincodesByCity(cityId) {
        try {
            const city = await this.db.city.findUnique({
                where: { id: cityId },
            });
            if (!city) {
                throw new common_1.NotFoundException('City not found');
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
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
                throw new common_1.NotFoundException('Pincode not found');
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
            const city = await this.db.city.findUnique({
                where: { id: createDto.cityId },
            });
            if (!city) {
                throw new common_1.NotFoundException('City not found');
            }
            const existingPincode = await this.db.pincode.findFirst({
                where: {
                    code: createDto.code,
                    cityId: createDto.cityId,
                },
            });
            if (existingPincode) {
                throw new common_1.BadRequestException('Pincode with this code already exists in the city');
            }
            const pincode = await this.db.pincode.create({
                data: createDto,
            });
            await this.logActivity(userId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'Pincode', pincode.id, `Pincode created: ${pincode.code} in ${city.name}`);
            return {
                id: pincode.id,
                code: pincode.code,
                area: pincode.area,
                cityId: pincode.cityId,
                isActive: pincode.isActive,
                createdAt: pincode.createdAt,
                updatedAt: pincode.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updatePincode(pincodeId, updateDto, userId) {
        try {
            const pincode = await this.db.pincode.findUnique({
                where: { id: pincodeId },
                include: { city: true },
            });
            if (!pincode) {
                throw new common_1.NotFoundException('Pincode not found');
            }
            if (updateDto.code && updateDto.code !== pincode.code) {
                const existingPincode = await this.db.pincode.findFirst({
                    where: {
                        code: updateDto.code,
                        cityId: updateDto.cityId || pincode.cityId,
                        id: { not: pincodeId },
                    },
                });
                if (existingPincode) {
                    throw new common_1.BadRequestException('Pincode with this code already exists in the city');
                }
            }
            const updatedPincode = await this.db.pincode.update({
                where: { id: pincodeId },
                data: updateDto,
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Pincode', pincodeId, `Pincode updated: ${updatedPincode.code}`);
            return {
                id: updatedPincode.id,
                code: updatedPincode.code,
                area: updatedPincode.area,
                cityId: updatedPincode.cityId,
                isActive: updatedPincode.isActive,
                createdAt: updatedPincode.createdAt,
                updatedAt: updatedPincode.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async deletePincode(pincodeId, userId) {
        try {
            const pincode = await this.db.pincode.findUnique({
                where: { id: pincodeId },
            });
            if (!pincode) {
                throw new common_1.NotFoundException('Pincode not found');
            }
            await this.db.pincode.delete({
                where: { id: pincodeId },
            });
            await this.logActivity(userId, client_1.LogAction.DELETE, client_1.LogLevel.CRITICAL, 'Pincode', pincodeId, `Pincode deleted: ${pincode.code}`);
            return { message: 'Pincode deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async logActivity(userId, action, level, entity, entityId, description, metadata, ipAddress, userAgent) {
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
        }
        catch (error) {
            console.error('Failed to log activity:', error);
        }
    }
    handleException(error) {
        throw new common_1.InternalServerErrorException("Can't process location request");
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], LocationService);
//# sourceMappingURL=location.service.js.map