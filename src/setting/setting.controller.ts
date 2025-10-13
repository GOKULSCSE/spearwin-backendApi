import { Body, Controller, Get, Param, Query } from '@nestjs/common';

@Controller('setting')
export class SettingController {
  @Get()
  fineAll() {
    return '';
  }

  @Get(':id')
  findSettingById(
    @Body() body: { id: string; name: string },
    @Param() id: string,
  ) {
    return body;
  }
}
