import { IsNotEmpty, IsEnum, Min, Max } from 'class-validator';
import { EWeatherDataPart } from '../entities/weather.entity';

export class CreateWeatherDto {
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  lon: number;

  @IsNotEmpty()
  @IsEnum(EWeatherDataPart)
  part: EWeatherDataPart;
}
