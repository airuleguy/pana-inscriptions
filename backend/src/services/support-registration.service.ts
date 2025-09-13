import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportStaff } from '../entities/support.entity';
import { Tournament } from '../entities/tournament.entity';
import { CreateSupportRegistrationDto } from '../dto/create-support-registration.dto';
import { RegistrationStatus } from '../constants/registration-status';
import { StorageFactory } from './storage.factory';
import { getMimeTypeFromBuffer } from '../utils/file-utils';

@Injectable()
export class SupportRegistrationService {
  constructor(
    @InjectRepository(SupportStaff)
    private readonly supportRepository: Repository<SupportStaff>,
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
    private readonly storageFactory: StorageFactory,
  ) {}

  async create(dto: CreateSupportRegistrationDto): Promise<SupportStaff> {
    const tournament = await this.tournamentRepository.findOne({ where: { id: dto.tournamentId } });
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${dto.tournamentId} not found`);
    }

    const support = this.supportRepository.create({
      ...dto,
      tournament,
    });
    return await this.supportRepository.save(support);
  }

  async findAll(country?: string, tournamentId?: string): Promise<SupportStaff[]> {
    const qb = this.supportRepository.createQueryBuilder('support')
      .leftJoinAndSelect('support.tournament', 'tournament');

    if (country) qb.where('support.country = :country', { country });
    if (tournamentId) qb.andWhere('tournament.id = :tournamentId', { tournamentId });

    return await qb.getMany();
  }

  async findOne(id: string): Promise<SupportStaff> {
    const support = await this.supportRepository.findOne({ where: { id }, relations: ['tournament'] });
    if (!support) throw new NotFoundException(`Support registration with ID ${id} not found`);
    return support;
  }

  async update(id: string, updateData: Partial<CreateSupportRegistrationDto>): Promise<SupportStaff> {
    const support = await this.findOne(id);
    if (updateData.tournamentId && updateData.tournamentId !== support.tournament.id) {
      const tournament = await this.tournamentRepository.findOne({ where: { id: updateData.tournamentId } });
      if (!tournament) throw new NotFoundException(`Tournament with ID ${updateData.tournamentId} not found`);
      support.tournament = tournament;
    }
    Object.assign(support, updateData);
    return await this.supportRepository.save(support);
  }

  async remove(id: string): Promise<void> {
    const support = await this.findOne(id);
    await this.supportRepository.remove(support);
  }

  async findByStatus(status: RegistrationStatus, country?: string, tournamentId?: string): Promise<SupportStaff[]> {
    const qb = this.supportRepository.createQueryBuilder('support')
      .leftJoinAndSelect('support.tournament', 'tournament')
      .where('support.status = :status', { status });
    if (country) qb.andWhere('support.country = :country', { country });
    if (tournamentId) qb.andWhere('tournament.id = :tournamentId', { tournamentId });
    return await qb.getMany();
  }

  async updateStatus(id: string, status: RegistrationStatus, notes?: string): Promise<boolean> {
    try {
      const support = await this.supportRepository.findOne({ where: { id } });
      if (!support) return false;
      support.status = status;
      await this.supportRepository.save(support);
      return true;
    } catch {
      return false;
    }
  }

  async updateStatusBatch(
    fromStatus: RegistrationStatus,
    toStatus: RegistrationStatus,
    country?: string,
    tournamentId?: string,
    notes?: string
  ): Promise<number> {
    const qb = this.supportRepository.createQueryBuilder('support')
      .leftJoinAndSelect('support.tournament', 'tournament')
      .where('support.status = :fromStatus', { fromStatus });
    if (country) qb.andWhere('support.country = :country', { country });
    if (tournamentId) qb.andWhere('tournament.id = :tournamentId', { tournamentId });

    const supports = await qb.getMany();
    for (const s of supports) {
      s.status = toStatus;
    }
    await this.supportRepository.save(supports);
    return supports.length;
  }

  /**
   * Uploads an image for a support staff member
   * @param id The ID of the support staff
   * @param imageBuffer The image file buffer
   * @returns The updated support staff entity
   */
  async uploadImage(id: string, imageBuffer: Buffer): Promise<SupportStaff> {
    const support = await this.findOne(id);

    // Delete existing image if present
    if (support.imageUrl) {
      try {
        await this.storageFactory.getStorage().deleteFile(support.imageUrl);
      } catch (error) {
        // Log error but continue with new upload
        console.error(`Failed to delete existing image for support ${id}:`, error);
      }
    }

    // Validate image buffer
    if (!this.isValidImageBuffer(imageBuffer)) {
      throw new BadRequestException('Invalid image format. Only JPEG, PNG, and GIF are supported.');
    }

    // Upload new image
    const imageUrl = await this.storageFactory.getStorage().uploadFile(
      imageBuffer,
      'support',
      support.id,
    );

    // Update support staff record
    support.imageUrl = imageUrl;
    return await this.supportRepository.save(support);
  }

  /**
   * Validates that the buffer contains a supported image format
   * @param buffer The file buffer to validate
   * @returns boolean indicating if the buffer is a valid image
   */
  private isValidImageBuffer(buffer: Buffer): boolean {
    const mimeType = getMimeTypeFromBuffer(buffer);
    return mimeType !== 'application/octet-stream';
  }
}


