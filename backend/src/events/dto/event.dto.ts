import { IsNumber, IsString, IsBoolean, IsOptional, IsDateString, IsObject, Min } from 'class-validator'

export class UpdateEventDto {
  @IsOptional()
  @IsNumber()
  @Min(2024)
  year?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  edition?: number

  @IsOptional()
  @IsDateString()
  raceDate?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  startTime10K?: string

  @IsOptional()
  @IsString()
  startTime2K?: string

  @IsOptional()
  @IsNumber()
  totalPrize?: number

  @IsOptional()
  @IsBoolean()
  registrationsOpen?: boolean

  @IsOptional()
  @IsDateString()
  openDate?: string

  @IsOptional()
  @IsDateString()
  closeDate?: string

  @IsOptional()
  @IsObject()
  categorySlots?: {
    geral?: number
    morador?: number
    sessenta?: number
    infantil?: number
  }
}








