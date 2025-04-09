import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateUpdateProductDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string

  @IsOptional()
  description: string

  @IsOptional()
  image?: string

  @IsNotEmpty({ message: 'Price is required' })
  price: number
}
