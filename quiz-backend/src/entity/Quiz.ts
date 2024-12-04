import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Question } from './Question';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  quiz_id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Question, (question) => question.quiz)
  @JoinColumn({ name: 'question_id' }) // Explicitly set the foreign key column name
  questions: Question[];
}
