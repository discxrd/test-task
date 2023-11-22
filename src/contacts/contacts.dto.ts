import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsDefined,
  MinLength,
  Matches,
} from 'class-validator';

export class ContactDto {
  @Matches(/\D+ \D+ \D+/, { message: 'Неверный формат имени' })
  @IsDefined()
  @IsString()
  @MinLength(3)
  name: string;

  @IsPhoneNumber()
  phone: string;

  @IsEmail()
  email: string;
}
