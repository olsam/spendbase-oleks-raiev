import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from './dto/response.dto';
import { EWeatherDataPart, Weather } from './entities/weather.entity';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => {
      return { data: this._formatResponse(data)};
    }));
  }

  private _formatResponse(response: Weather): ResponseDto | ResponseDto[] {
    switch (response.part) {
      case EWeatherDataPart.WEATHER:
        return this._mapWeather(response.data);
      case EWeatherDataPart.FORECAST:
        return this._mapForecast(response.data);
    }
  }

  private _mapWeather(data): ResponseDto {
    const result = {
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      pressure: data.main.pressure,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
    }

    return result;
  }

  private _mapForecast(data): ResponseDto[] {
    const result =  data.list.map((item) => {
      return {
        sunrise: data.city.sunrise,
        sunset: data.city.sunset,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        pressure: item.main.pressure,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
      }
    });

    return result;
  }
}
