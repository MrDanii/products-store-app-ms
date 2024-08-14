import { ArrayMinSize, IsArray, IsString, MinLength, ValidateNested } from "class-validator";
import { OrderDetailsDto } from "./order-details.dto";
import { Type } from "class-transformer";

export class CreateOrderDto {

  @IsString()
  @MinLength(1)
  createdBy: string
  
  @IsArray()
  @ValidateNested({each: true})
  @ArrayMinSize(1)
  @Type(() => OrderDetailsDto)
  items: OrderDetailsDto[]
}
