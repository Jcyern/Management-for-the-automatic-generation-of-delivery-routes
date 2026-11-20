import { Module } from "@nestjs/common";
import { OrderController } from "./Order.controller.js";
import { OrderService } from "./Order.service.js";
import { GeoModule } from "../geo/geo.module.js";


@Module({
    imports: [GeoModule],
    controllers: [OrderController],
    providers: [OrderService]
})
export class OrderModule
{

}
