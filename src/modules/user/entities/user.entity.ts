import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { IsBoolean, IsEnum } from 'class-validator';
import { Profile } from './profile.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @ApiProperty({ description: 'Unique user identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  uuid: string;

  @ApiProperty({ description: 'User email' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User password' })
  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Is user banned',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBanned: boolean;

  @Column({ type: 'text', nullable: true, default: null })
  refreshToken: string | null;

  @Column({ type: 'int', default: 0 })
  tokenVersion: number;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  tokenExpiredDate: Date | null;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isOAuthUser: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: Profile;

  @RelationId((user: User) => user.profile)
  profileId: number;
}
