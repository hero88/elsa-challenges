import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source';
import { Quiz } from '../../entity/Quiz';
import { Question } from '../../entity/Question';

const router = Router();

// Create a new quiz
router.post('/', async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
        const quizRepository = AppDataSource.getRepository(Quiz);
        const quiz = quizRepository.create({ name });
        const savedQuiz = await quizRepository.save(quiz);

        res.status(201).json({ quizId: savedQuiz.quiz_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create quiz.' });
    }
});

router.get('/:quizId/questions', async (req: Request, res: Response) => {
    const { quizId } = req.params;
    const { index } = req.query;

    try {
        const questionRepository = AppDataSource.getRepository(Question);

        // Find questions for the given quiz ID, ordered by ID or creation date
        const questions = await questionRepository.find({
            where: { quiz: { quiz_id: Number(quizId) } },
            order: { question_id: 'ASC' },
        });

        if (questions.length === 0 || Number(index) >= questions.length) {
            return res.status(404).json({ error: 'No more questions available.' });
        }

        // Return the question at the requested index
        const question = questions[Number(index)];
        res.json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch question.' });
    }
});


export default router;
