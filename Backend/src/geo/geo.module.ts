import { Module } from '@nestjs/common';
import { GeocodingService } from './geocoding.service.js';
import { NominatimProvider } from './nominatim.provider.js';
import { GEOCODING_PROVIDER } from './geo.types.js';

@Module({
  providers: [
    GeocodingService,
    { provide: GEOCODING_PROVIDER, useClass: NominatimProvider },
  ],
  exports: [GeocodingService],
})
export class GeoModule {}
