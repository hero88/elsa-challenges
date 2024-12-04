import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Quiz } from './Quiz';

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    question_id: number;

    @Column()
    question_text: string;

    @Column()
    correct_answer: string;

    @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quiz_id' }) // Explicitly set the foreign key column name
    quiz: Quiz;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
