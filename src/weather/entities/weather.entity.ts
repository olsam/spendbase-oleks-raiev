import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum EWeatherDataPart {
  WEATHER = 'weather',
  FORECAST = 'forecast',
  // CURRENT = 'current',
  // MINUTELY = 'minutely',
  // HOURLY = 'hourly',
  // DAILY = 'daily',
  // ALERTS = 'alerts',
}

@Entity('weather')
export class Weather {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lat: number;

  @Column()
  lon: number;

  @Column({
    type: 'enum',
    enum: EWeatherDataPart,
  })
  part: EWeatherDataPart;

  @Column('jsonb')
    // Should have used specific type (or types) here. But the real one is to complex. So I used "any" as this is just a test task
  data: any;
}
