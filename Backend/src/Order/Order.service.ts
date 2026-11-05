import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrderDto, UpdateOrderDto } from "./dto/Order.dto.js";
import { PrismaService } from "../prismaModule/prisma.service.js";
import { Estado_Pedido } from "../generated/prisma/client.js";


@Injectable({})
export class OrderService
{
    constructor( private prisma : PrismaService ) {}

    // Crea un pedido
    async create( dto : CreateOrderDto ) {
        return this.prisma.pedido.create({
            data : dto,
            include : { centro : true, coordinador : true },
        });
    }

    // Devuelve todos los pedidos. Si se pasa `estado`, filtra por ese estado.
    async findAll( estado? : Estado_Pedido ) {
        return this.prisma.pedido.findMany({
            where : estado ? { estado } : undefined,
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

    // Elimina un pedido (404 si no existe). Devuelve el pedido borrado con sus relaciones.
    async remove( id : number ) {
        await this.findOne( id );
        return this.prisma.pedido.delete({
            where : { id },
            include : { centro : true, coordinador : true },
        });
    }
}
