import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('follows')
export class Follow {
  @PrimaryColumn('uuid')
  followerId: string;

  @PrimaryColumn('uuid')
  followingId: string;

  @CreateDateColumn()
  createdAt: Date;
}
