import { Controller, Get, Post, Body, Query, HttpCode, UseInterceptors } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { ResponseFormatInterceptor} from './responseFormat.interseptor';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @Get()
  @UseInterceptors(ResponseFormatInterceptor)
  // Ideally there should be a separate type for query
  // But in this case create DTO works perfectly here
  findOne(@Query() query: CreateWeatherDto) {
    return this.weatherService.findOne(query);
  }
}
