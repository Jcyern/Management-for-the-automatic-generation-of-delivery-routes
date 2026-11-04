import { Module } from "@nestjs/common";
import { AuthController } from "./Auth.controller.js";
import { AuthService } from "./Auth.service.js";


@Module({
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule
{

}