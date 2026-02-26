import { IsEmail, IsString, IsOptional, MinLength, IsUUID } from 'class-validator'

export class CreateUserDto {
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsUUID()
  roleId: string

  @IsOptional()
  @IsString()
  avatar?: string
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  avatar?: string

  @IsOptional()
  @IsUUID()
  roleId?: string

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string
}








