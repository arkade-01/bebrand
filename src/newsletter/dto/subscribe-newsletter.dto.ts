import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SubscribeNewsletterDto {
  @ApiProperty({
    description: 'Email address to subscribe to newsletter',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
