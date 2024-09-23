import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { EntityManager } from 'typeorm';
import { LoggerService } from 'src/core/logger/logger.service';
import { Role } from 'src/modules/roles/entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = this.entityManager.create(Role, createRoleDto);
    await this.entityManager.save(role);
    this.logger.log(`Role created with id: ${role.id}`);
    return role;
  }

  async findAll() {
    return await this.entityManager.find(Role);
  }

  async findOne(id: number) {
    const role = await this.entityManager.findOne(Role, {
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      this.logger.error(`Role not found with id: ${id}`, '');
      throw new Error(`Role not found with id: ${id}`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.entityManager.preload(Role, {
      id,
      ...updateRoleDto,
    });
    if (!role) {
      this.logger.error(`Role not found with id: ${id}`,'');
      throw new Error(`Role not found with id: ${id}`);
    }
    await this.entityManager.save(role);
    this.logger.log(`Role updated with id: ${id}`);
    return role;
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    await this.entityManager.remove(role);
    this.logger.log(`Role removed with id: ${id}`);
    return { deleted: true };
  }
}
