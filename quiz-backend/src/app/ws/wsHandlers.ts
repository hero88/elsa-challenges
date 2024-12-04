import { WebSocket, WebSocketServer } from 'ws';
import { AppDataSource } from '../../config/data-source';
import { Quiz } from '../../entity/Quiz';
import { Question } from '../../entity/Question';
import { Leaderboard } from '../../entity/Leaderboard';
import { User } from '../../entity/User';

export async function handleJoinQuiz(ws: WebSocket, quizId: number, userId: number) {
    try {
        const quizRepository = AppDataSource.getRepository(Quiz);
        const quiz = await quizRepository.findOneBy({ quiz_id: quizId });

        if (!quiz) {
            ws.send(JSON.stringify({ type: 'error', payload: 'Quiz not found' }));
            return;
        }

        ws.send(JSON.stringify({ type: 'quiz_joined', payload: { quizId, userId } }));
    } catch (error) {
        console.error(error);
        ws.send(JSON.stringify({ type: 'error', payload: 'An error occurred while joining the quiz.' }));
    }
}

export async function handleSubmitAnswer(ws: WebSocket, { quizId, userId, answer, questionIndex }: any, wss: WebSocketServer) {
    try {
        const questionRepository = AppDataSource.getRepository(Question);
        const leaderboardRepository = AppDataSource.getRepository(Leaderboard);

        // Find all questions for the quiz and validate the index
        const questions = await questionRepository.find({
            where: { quiz: { quiz_id: Number(quizId) } },
            order: { question_id: 'ASC' },
        });
    
        if (questionIndex >= questions.length) {
            ws.send(JSON.stringify({ type: 'error', payload: 'Invalid question index.' }));
            return;
        }

        const currentQuestion = questions[questionIndex];
        const isCorrect = answer === currentQuestion.correct_answer;
        const score = isCorrect ? 10 : 0;

        let leaderboardEntry = await leaderboardRepository.findOneBy({ quiz: { quiz_id: quizId }, user: { user_id: userId } });
        if (!leaderboardEntry) {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ user_id: userId });

            if (!user) {
                ws.send(JSON.stringify({ type: 'error', payload: 'User not found.' }));
                return;
            }

            leaderboardEntry = leaderboardRepository.create({ quiz: { quiz_id: quizId }, user, score });
        } else {
            leaderboardEntry.score += score;
        }

        await leaderboardRepository.save(leaderboardEntry);

        const leaderboard = await leaderboardRepository.find({
            where: { quiz: { quiz_id: quizId } },
            relations: ['user'],
            order: { score: 'DESC' },
        });

        broadcastLeaderboard(wss, quizId, leaderboard);
    } catch (error) {
        console.error(error);
        ws.send(JSON.stringify({ type: 'error', payload: 'An error occurred while submitting the answer.' }));
    }
}

function broadcastLeaderboard(wss: WebSocketServer, quizId: number, leaderboard: Leaderboard[]) {
    const formattedLeaderboard = leaderboard.map((entry) => ({
        userId: entry.user.user_id,
        username: entry.user.username, // Include the username
        score: entry.score,
    }));
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'leaderboard_update', payload: { quizId, formattedLeaderboard } }));
        }
    });
}
