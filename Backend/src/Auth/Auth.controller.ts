import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./Auth.service.js";
import { AuthDto } from "./dto/Auth.dto.js";


@Controller({})
export class AuthController
{
    constructor(private authService : AuthService){}

    @Post('SignIn')
    SignIn(@Body() dto : AuthDto) {
        return this.authService.SignIn(dto);
    }
}