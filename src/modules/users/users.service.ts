import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { EntityManager } from 'typeorm';
import { LoggerService } from 'src/core/logger/logger.service';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return await this.entityManager.find(User);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
