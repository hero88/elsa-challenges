import { WebSocket, WebSocketServer } from 'ws';
import { AppDataSource } from '../../config/data-source';
import { Quiz } from '../../entity/Quiz';
import { Question } from '../../entity/Question';
import { Leaderboard } from '../../entity/Leaderboard';
import { User } from '../../entity/User';
import { LeaderboardService } from '../services/LeaderboardService';

/**
 * Handles a WebSocket message to join a quiz.
 * @param {WebSocket} ws The WebSocket object
 * @param {number} quizId The ID of the quiz to join
 * @param {number} userId The ID of the user joining the quiz
 * @returns {void}
 */
export async function handleJoinQuiz(ws: WebSocket, quizId: number, userId: number) {
    try {
        const leaderboardRepository = AppDataSource.getRepository(Leaderboard);
        const userRepository = AppDataSource.getRepository(User);
        const quizRepository = AppDataSource.getRepository(Quiz);
        const quiz = await quizRepository.findOneBy({ quiz_id: quizId });

        if (!quiz) {
            ws.send(JSON.stringify({ type: 'error', payload: 'Quiz not found' }));
            return;
        }

        // Check if the user exists
        let user = await userRepository.findOneBy({ user_id: userId });
        if (!user) {
            ws.send(JSON.stringify({ type: 'error', payload: 'User not found.' }));
            return;
        }

        // Check if the user already exists in the leaderboard for this quiz
        let leaderboardEntry = await leaderboardRepository.findOne({
            where: { quiz: { quiz_id: quizId }, user: { user_id: userId } },
        });

        if (!leaderboardEntry) {
            // Create a new leaderboard record
            leaderboardEntry = leaderboardRepository.create({
                quiz,
                user,
                score: 0, // Initialize the score to 0 for new participants
            });
            await leaderboardRepository.save(leaderboardEntry);
        }

        ws.send(JSON.stringify({ type: 'quiz_joined', payload: { quizId, userId } }));
    } catch (error) {
        console.error(error);
        ws.send(JSON.stringify({ type: 'error', payload: 'An error occurred while joining the quiz.' }));
    }
}

/**
 * Handles a submission of an answer from a user, updates the leaderboard accordingly
 * and broadcasts the updated leaderboard to all connected clients.
 * @param {WebSocket} ws The WebSocket connection that sent the message.
 * @param {{ quizId: number, userId: number, answer: string, questionIndex: number }} message The message with the answer.
 * @param {WebSocketServer} wss The WebSocket server to broadcast the updated leaderboard to.
 */
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
        await broadcastLeaderboard(wss, quizId);
    } catch (error) {
        console.error(error);
        ws.send(JSON.stringify({ type: 'error', payload: 'An error occurred while submitting the answer.' }));
    }
}

/**
 * Broadcasts the updated leaderboard to all connected WebSocket clients.
 * @param {WebSocketServer} wss - The WebSocket server instance.
 * @param {number} quizId - The ID of the quiz for which the leaderboard is being broadcasted.
 * Retrieves the leaderboard data for the specified quizId, formats it, and sends it to all clients connected to the WebSocket server.
 * Each client receives a message with type 'leaderboard_update' and the formatted leaderboard as the payload.
 */
async function broadcastLeaderboard(wss: WebSocketServer, quizId: number) {
    const leaderboardService = new LeaderboardService();
    const leaderboard = await leaderboardService.getLeaderboard(quizId);

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
