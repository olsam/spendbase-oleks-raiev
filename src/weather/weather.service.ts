import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError } from 'axios';
import * as process from 'process';
import { catchError, firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { Weather } from './entities/weather.entity';

@Injectable()
export class WeatherService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(Weather)
    private weatherRepository: Repository<Weather>,
  ) {}
  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    try {
      const { lat, lon, part } = createWeatherDto;
      const { data } = await firstValueFrom(
        // Should have used specific type (or types) here. But the real one is to complex. So I used "any" as this is just a test task
        this.httpService.get<{ data: any }>(`/data/2.5/${part}`, {
          params: { lat, lon, appid: this.configService.get<string>('API_KEY')}
        }).pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(
              'Internal Server Error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      const item = new Weather();
      item.lat = lat;
      item.lon = lon;
      item.part = part;
      item.data = data;

      return this.weatherRepository.save(item);
    } catch (err) {
      // Should log specific error here and throw generic one
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(query: CreateWeatherDto): Promise<Weather> {
    try {
      // As there is no specific task for getting multiple records I'm gust getting one
      const item = await this.weatherRepository.findOneBy({
        lat: query.lat,
        lon: query.lon,
        part: query.part,
      });

      if (!item) {
        throw new HttpException('Not found', HttpStatus.NOT_FOUND);
      }

      return item;
    } catch (err) {
      if (err.status === HttpStatus.NOT_FOUND) {
        throw err;
      }

      // Log specific error here and throw generic one
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
