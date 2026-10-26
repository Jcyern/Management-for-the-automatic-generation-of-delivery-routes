import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto/Auth.dto.js";
import { PrismaService } from "../prismaModule/prisma.service.js";
import { Rol } from "../generated/prisma/client.js";
import { JwtService } from "@nestjs/jwt";


@Injectable({})
export class AuthService 
{
    constructor( 
        private prisma : PrismaService,
        private jwt: JwtService 
    ) {}

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
        const { password: _password, coordinador, repartidor, ...datos } = user;
        
        // payload para el Token
        const payload = { sub: user.id, email: user.correo, rol: user.rol };

        let userData;
        if(user.rol === Rol.LOGISTICO || user.rol === Rol.SUPERVISOR) userData = { ...datos, coordinador };
        else if(user.rol === Rol.REPARTIDOR) userData = { ...datos, repartidor };
        else throw new ForbiddenException("Wrong Credentials");

        return {
            user: userData,
            access_token: await this.jwt.signAsync(payload)
        };
    }
}
