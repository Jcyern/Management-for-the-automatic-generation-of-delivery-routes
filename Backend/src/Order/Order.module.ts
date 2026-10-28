import { Module } from "@nestjs/common";
import { OrderController } from "./Order.controller.js";
import { OrderService } from "./Order.service.js";


@Module({
    controllers: [OrderController],
    providers: [OrderService]
})
export class OrderModule
{

}