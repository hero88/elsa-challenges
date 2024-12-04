import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Quiz } from './Quiz';
import { User } from './User';

@Entity()
export class Leaderboard {
  @PrimaryGeneratedColumn()
  leaderboard_id: number;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' }) // Explicitly set the foreign key column name
  quiz: Quiz;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // Explicitly set the foreign key column name
  user: User;

  @Column({ default: 0 })
  score: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
