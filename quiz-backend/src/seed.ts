import { AppDataSource } from './config/data-source';
import { Quiz } from './entity/Quiz';
import { Question } from './entity/Question';
import { User } from './entity/User';
import { Leaderboard } from './entity/Leaderboard';

const seed = async () => {
  await AppDataSource.initialize();

  const quizRepo = AppDataSource.getRepository(Quiz);
  const questionRepo = AppDataSource.getRepository(Question);
  const userRepo = AppDataSource.getRepository(User);
  const leaderboardRepo = AppDataSource.getRepository(Leaderboard);

  const quiz = await quizRepo.save({ name: 'English Vocabulary Quiz' });

  await questionRepo.save([
    { quiz, question_text: 'What is the synonym of "happy"?', correct_answer: 'joyful' },
    { quiz, question_text: 'What is the antonym of "fast"?', correct_answer: 'slow' },
  ]);

  const user1 = await userRepo.save({ username: 'user1' });
  const user2 = await userRepo.save({ username: 'user2' });

  await leaderboardRepo.save([
    { quiz, user: user1, score: 10 },
    { quiz, user: user2, score: 20 },
  ]);

  console.log('Seed data inserted!');
  process.exit(0);
};

seed();
