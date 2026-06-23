import { Controller, Get, Param, ParseIntPipe, Res, Sse } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SseService } from './sse.service';

@ApiTags('SSE')
@Controller('events')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Get(':id/stream')
  @Sse()
  stream(@Param('id', ParseIntPipe) id: number): Observable<MessageEvent> {
    return this.sseService.getEventStream(id).pipe(
      map((event) => ({
        data: JSON.stringify(event),
        type: event.type,
      } as MessageEvent)),
    );
  }
}
