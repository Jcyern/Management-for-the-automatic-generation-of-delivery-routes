import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto/Auth.dto.js";
import { PrismaService } from "../prismaModule/prisma.service.js";
import { Rol } from "../generated/prisma/client.js";


@Injectable({})
export class AuthService 
{
    constructor( private prisma : PrismaService ) {}

    async SignIn( dto : AuthDto ) {
        //find the user (traigo coordinador y repartidor con el include)
        const user = await this.prisma.usuario.findUnique({
            where : {
                correo : dto.email,
            },
            include : {
                coordinador: true,
                repartidor: true,
            },
        });
        if(!user) throw new ForbiddenException("Wrong Crendetials"); 
        //check password
        else if(user.password != dto.password) throw new ForbiddenException("Wrong Credentials");

        //segun el enum del usuario, incluir el correspondiente en el return (sin la contrasenna)
        const { password, coordinador, repartidor, ...datos } = user;
        if(user.rol === Rol.LOGISTICO || user.rol === Rol.SUPERVISOR) return { ...datos, coordinador };
        else if(user.rol === Rol.REPARTIDOR) return { ...datos, repartidor };
        else throw new ForbiddenException("Wrong Credentials");
    }
}
