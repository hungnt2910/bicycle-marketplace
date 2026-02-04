import { Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  @Post()
  async createUser() {
    // Implementation will go here
    // return UsersService.createUser();
  }
}
