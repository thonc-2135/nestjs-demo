import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  attachableType: string;

  @Column('uuid')
  attachableId: string;

  @Column()
  url: string;

  @Column()
  fileName: string;

  @Column()
  fileType: string;

  @Column('int')
  fileSize: number;

  @CreateDateColumn()
  createdAt: Date;
}
