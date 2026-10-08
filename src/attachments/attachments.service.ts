import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity.js';
import type { CreateAttachmentData } from './interfaces/create-attachment-data.interface.js';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentsRepository: Repository<Attachment>,
  ) {}

  create(data: CreateAttachmentData): Promise<Attachment> {
    const attachment = this.attachmentsRepository.create(data);
    return this.attachmentsRepository.save(attachment);
  }
}
