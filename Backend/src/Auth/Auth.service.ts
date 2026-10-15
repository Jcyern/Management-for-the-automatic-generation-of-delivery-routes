import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto/Auth.dto.js";
import { PrismaService } from "../prismaModule/prisma.service.js";


@Injectable({})
export class AuthService 
{
    constructor( private prisma : PrismaService ) {}

    async SignIn( dto : AuthDto ) {
        //find the user
        const user = await this.prisma.user.findUnique({
            where : {
                email : dto.email,
            }
        });
        if(!user) throw new ForbiddenException("Wrong Crendetials"); 
        //check password
        else if(user.password != dto.password) throw new ForbiddenException("Wrong Credentials");

        return user;
    }
}