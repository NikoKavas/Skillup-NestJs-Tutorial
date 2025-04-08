import { IsEmail, IsNotEmpty, IsOptional, Matches } from 'class-validator'
import { Match } from 'decorators/match.decorator'

export class CreateUserDto {
  @IsOptional()
  first_name?: string

  @IsOptional()
  last_name?: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  role_id: string

  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message:
      'Password must contain at least 6 characters, one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string

  @IsNotEmpty()
  @Match(CreateUserDto, (field) => field.password, { message: 'Passwords do not match' })
  confirm_password: string
}
