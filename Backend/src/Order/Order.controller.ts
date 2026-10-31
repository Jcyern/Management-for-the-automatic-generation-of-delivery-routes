import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { OrderService } from "./Order.service.js";
import { CreateOrderDto, FilterOrderDto, UpdateOrderDto } from "./dto/Order.dto.js";


@Controller('order')
export class OrderController
{
    constructor( private orderService : OrderService ){}

    // POST /order
    @Post()
    create( @Body() dto : CreateOrderDto ) {
        return this.orderService.create(dto);
    }

    // GET /order  ·  GET /order?estado=Pendiente
    @Get()
    findAll( @Query() filter : FilterOrderDto ) {
        return this.orderService.findAll(filter.estado);
    }

    // GET /order/:id
    @Get(':id')
    findOne( @Param('id', ParseIntPipe) id : number ) {
        return this.orderService.findOne(id);
    }

    // PUT /order/:id
    @Put(':id')
    update( @Param('id', ParseIntPipe) id : number, @Body() dto : UpdateOrderDto ) {
        return this.orderService.update(id, dto);
    }

    // DELETE /order/:id
    @Delete(':id')
    remove( @Param('id', ParseIntPipe) id : number ) {
        return this.orderService.remove(id);
    }
}
