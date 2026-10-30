import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    ValidateIf,
} from "class-validator";
import { Estado_Pedido } from "../../generated/prisma/client.js";

// Valida solo si el campo viene en el body (undefined = no enviado).
// A diferencia de @IsOptional(), un `null` explícito NO se ignora:
// se valida y falla con 400, en vez de llegar a Prisma y reventar con 500.
const ifDefined = (_object : unknown, value : unknown) => value !== undefined;

// Dto para crear un Pedido (modelo Pedido del schema).
// `id` es autoincremental y las relaciones (centro / coordinador)
// se envían por su clave foránea (idCentro / idCoordinador).
// Las fechas se reciben como string ISO-8601 (ej. "2026-10-25T18:00:00Z").
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

    // Opcional: si no se envía, la BD usa now() (@default(now())).
    @ValidateIf(ifDefined)
    @IsDateString()
    fechaCreado? : string;

    // Opcional: fecha límite de entrega.
    @ValidateIf(ifDefined)
    @IsDateString()
    fechaLimite? : string;

    // Opcional: si no se envía, la BD usa Pendiente (@default(Pendiente)).
    @ValidateIf(ifDefined)
    @IsEnum(Estado_Pedido)
    estado? : Estado_Pedido;

    @IsString()
    @IsNotEmpty()
    destinatario : string;

    @IsString()
    @IsNotEmpty()
    direccion : string;
}

// Dto para actualizar un Pedido: mismos campos pero todos opcionales.
export class UpdateOrderDto
{
    @ValidateIf(ifDefined)
    @IsString()
    @IsNotEmpty()
    prioridad? : string;

    @ValidateIf(ifDefined)
    @IsString()
    @IsNotEmpty()
    tipoEntrega? : string;

    @ValidateIf(ifDefined)
    @IsString()
    @IsNotEmpty()
    zona? : string;

    @ValidateIf(ifDefined)
    @IsInt()
    @IsPositive()
    idCentro? : number;

    @ValidateIf(ifDefined)
    @IsInt()
    @IsPositive()
    idCoordinador? : number;

    @ValidateIf(ifDefined)
    @IsDateString()
    fechaCreado? : string;

    @ValidateIf(ifDefined)
    @IsDateString()
    fechaLimite? : string;

    @ValidateIf(ifDefined)
    @IsEnum(Estado_Pedido)
    estado? : Estado_Pedido;

    @ValidateIf(ifDefined)
    @IsString()
    @IsNotEmpty()
    destinatario? : string;

    @ValidateIf(ifDefined)
    @IsString()
    @IsNotEmpty()
    direccion? : string;
}

// Dto para filtrar el listado de pedidos (query params).
export class FilterOrderDto
{
    @IsOptional()
    @IsEnum(Estado_Pedido)
    estado? : Estado_Pedido;
}
