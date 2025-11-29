import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerPath } from './entities/career-path.entity';
import { CreateCareerPathDto } from './dto/create-career-path.dto';
import { UpdateCareerPathDto } from './dto/update-career-path.dto';

@Injectable()
export class CareerPathsService {
  constructor(
    @InjectRepository(CareerPath)
    private readonly repo: Repository<CareerPath>,
  ) {}

  async create(dto: CreateCareerPathDto): Promise<CareerPath[]> {
    const entity = this.repo.create({...dto, department: {id : dto.departmentId}} as any);
    return this.repo.save(entity);
  }

  async findAll(
    companyId: string,
    options?: { departmentId?: string; currentRoleId?: string },
  ): Promise<CareerPath[]> {
    const where: any = { companyId };

    if (options?.departmentId) {
      // filtra pelo departamento via relação
      where.department = { id: options.departmentId };
    }

    if (options?.currentRoleId) {
      where.currentRoleId = options.currentRoleId;
    }

    return this.repo.find({
      where,
      relations: ['department', 'currentRole', 'nextRole'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findOne(companyId: string, id: string): Promise<CareerPath> {
    const path = await this.repo.findOne({
      where: { id, companyId },
      relations: ['department', 'currentRole', 'nextRole'],
    });

    if (!path) {
      throw new NotFoundException('Career path not found');
    }

    return path;
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateCareerPathDto,
  ): Promise<CareerPath> {
    const path = await this.findOne(companyId, id);
    const merged = this.repo.merge(path, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const path = await this.findOne(companyId, id);
    await this.repo.remove(path);
  }
}
