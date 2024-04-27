import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { Repository } from 'typeorm';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { EWeatherDataPart, Weather } from './entities/weather.entity';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;
  let configService: ConfigService;
  let repository: Repository<Weather>;

  const configValue: string = 'config_value';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(configValue) },
        },
        {
          provide: getRepositoryToken(Weather),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    repository = module.get<Repository<Weather>>(getRepositoryToken(Weather));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const weatherCreateDto: CreateWeatherDto = {
    lat: 0,
    lon: 0,
    part: EWeatherDataPart.WEATHER,
  };
  const weatherApiResponse = {
    coord: {
      lon: 0,
      lat: 0
    },
    weather: [
      {
        id: 500,
        main: 'Rain',
        description: 'light rain',
        icon: '10d'
      }
    ],
    base: 'stations',
    main: {
      temp: 301.76,
      feels_like: 306.83,
      temp_min: 301.76,
      temp_max: 301.76,
      pressure: 1007,
      humidity: 80,
      sea_level: 1007,
      grnd_level: 1007
    },
    visibility: 10000,
    wind: {
      speed: 3.6,
      deg: 143,
      gust: 3.61
    },
    rain: {
      '1h': 0.44
    },
    clouds: {
      all: 100
    },
    dt: 1714149611,
    sys: {
      sunrise: 1714110851,
      sunset: 1714154461
    },
    timezone: 0,
    id: 6295630,
    name: 'Globe',
    cod: 200
  };
  const weatherDbItem = {
    id: 1,
    ...weatherCreateDto,
    data: weatherApiResponse,
  };
  const weatherEntityItem = new Weather();
  weatherEntityItem.lat = weatherCreateDto.lat;
  weatherEntityItem.lon = weatherCreateDto.lon;
  weatherEntityItem.part = weatherCreateDto.part;
  weatherEntityItem.data = weatherApiResponse;

  describe('create', () => {
    it('should create a record in the database', async () => {
      const mockWeatherApiResponse: AxiosResponse = {
        status: 200,
        statusText: '',
        headers: {},
        config: { headers: undefined },
        data: weatherApiResponse,
      };

      const httpGetSpy = jest.spyOn(httpService, 'get')
        .mockImplementationOnce(() => of(mockWeatherApiResponse));
      const repoSaveSpy = jest.spyOn(repository, 'save').mockResolvedValueOnce(weatherDbItem);

      const actualResult = await service.create(weatherCreateDto);

      expect(actualResult).toEqual(weatherDbItem);

      expect(httpGetSpy).toHaveBeenCalledTimes(1);
      expect(httpGetSpy).toHaveBeenCalledWith(`/data/2.5/${weatherCreateDto.part}`, {
        params: { lat: weatherCreateDto.lat, lon: weatherCreateDto.lon, appid: configValue },
      });

      expect(repoSaveSpy).toHaveBeenCalledTimes(1);
      expect(repoSaveSpy).toHaveBeenCalledWith(weatherEntityItem);
    });

    it('should throw an error when API request fails', () => {
      const expectedError = new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      const httpGetSpy = jest.spyOn(httpService, 'get')
        .mockImplementationOnce(() => throwError({ message: 'Error' }));
      const repoSaveSpy = jest.spyOn(repository, 'save');

      expect(service.create(weatherCreateDto)).rejects.toMatchObject(expectedError);

      expect(httpGetSpy).toHaveBeenCalledTimes(1);
      expect(httpGetSpy).toHaveBeenCalledWith(`/data/2.5/${weatherCreateDto.part}`, {
        params: { lat: weatherCreateDto.lat, lon: weatherCreateDto.lon, appid: configValue },
      });

      expect(repoSaveSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('findOne', () => {
    it('should return single item from DB', async () => {
      const repoFindSpy = jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(weatherDbItem);

      const actualResult = await service.findOne(weatherCreateDto);

      expect(actualResult).toEqual(weatherDbItem);

      expect(repoFindSpy).toHaveBeenCalledTimes(1);
      expect(repoFindSpy).toHaveBeenCalledWith({
        lat: weatherCreateDto.lat,
        lon: weatherCreateDto.lon,
        part: weatherCreateDto.part,
      });
    });

    it('should throw 404 error if nothing was found', () => {
      const expectedError = new HttpException('Not found', HttpStatus.NOT_FOUND);

      const repoFindSpy = jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);

      expect(service.findOne(weatherCreateDto)).rejects.toMatchObject(expectedError);

      expect(repoFindSpy).toHaveBeenCalledTimes(1);
      expect(repoFindSpy).toHaveBeenCalledWith({
        lat: weatherCreateDto.lat,
        lon: weatherCreateDto.lon,
        part: weatherCreateDto.part,
      });
    });

    it('should throw internal error if DB request failed', () => {
      const expectedError = new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      const repoFindSpy = jest.spyOn(repository, 'findOneBy').mockRejectedValueOnce(new Error('DB Error'));

      expect(service.findOne(weatherCreateDto)).rejects.toMatchObject(expectedError);

      expect(repoFindSpy).toHaveBeenCalledTimes(1);
      expect(repoFindSpy).toHaveBeenCalledWith({
        lat: weatherCreateDto.lat,
        lon: weatherCreateDto.lon,
        part: weatherCreateDto.part,
      });
    });
  });
});
