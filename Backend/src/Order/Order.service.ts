import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrderDto, UpdateOrderDto } from "./dto/Order.dto.js";
import { PrismaService } from "../prismaModule/prisma.service.js";


@Injectable({})
export class OrderService
{
    constructor( private prisma : PrismaService ) {}

    // Crea un pedido. El `id` lo genera la BD (autoincrement).
    async create( dto : CreateOrderDto ) {
        return this.prisma.pedido.create({
            data : dto,
            include : { centro : true, coordinador : true },
        });
    }

    // Devuelve todos los pedidos.
    async findAll() {
        return this.prisma.pedido.findMany({
            include : { centro : true, coordinador : true },
        });
    }

    // Devuelve un pedido por su id (404 si no existe).
    async findOne( id : number ) {
        const pedido = await this.prisma.pedido.findUnique({
            where : { id },
            include : { centro : true, coordinador : true },
        });
        if( !pedido ) throw new NotFoundException(`Pedido ${id} not found`);
        return pedido;
    }

    // Actualiza un pedido (404 si no existe).
    async update( id : number, dto : UpdateOrderDto ) {
        await this.findOne( id );
        return this.prisma.pedido.update({
            where : { id },
            data : dto,
            include : { centro : true, coordinador : true },
        });
    }

    // Elimina un pedido (404 si no existe).
    async remove( id : number ) {
        await this.findOne( id );
        return this.prisma.pedido.delete({ where : { id } });
    }
}
