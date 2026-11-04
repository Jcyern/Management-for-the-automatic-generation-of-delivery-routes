import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

// Dto para crear un Pedido (modelo Pedido del schema).
// `id` es autoincremental y las relaciones (centro / coordinador)
// se envían por su clave foránea (idCentro / idCoordinador).
export class CreateOrderDto
{
    @IsString()
    @IsNotEmpty()
    prioridad : string;

    @IsString()
    @IsNotEmpty()
    tipoEntrega : string;

    @IsString()
    @IsNotEmpty()
    zona : string;

    @IsInt()
    @IsPositive()
    idCentro : number;

    @IsInt()
    @IsPositive()
    idCoordinador : number;
}

// Dto para actualizar un Pedido: mismos campos pero todos opcionales.
export class UpdateOrderDto
{
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    prioridad? : string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    tipoEntrega? : string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    zona? : string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    idCentro? : number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    idCoordinador? : number;
}
