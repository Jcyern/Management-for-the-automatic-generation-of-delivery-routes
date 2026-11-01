import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { OrderService } from "./Order.service.js";
import { CreateOrderDto, FilterOrderDto, UpdateOrderDto } from "./dto/Order.dto.js";
import { Roles } from '../Auth/roles.decorator.js';
import { RolEfectivo } from '../Auth/roles.js';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Get()
  findAll(@Query() filter: FilterOrderDto) {
    return this.orderService.findAll(filter.estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Put(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }
}