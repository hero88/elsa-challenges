import { WebSocketServer } from 'ws';
import { handleJoinQuiz, handleSubmitAnswer } from './wsHandlers';

export const initializeWebSocketServer = () => {
    const WS_PORT = 8081;
    const wss = new WebSocketServer({ port: WS_PORT });
    console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);

    wss.on('connection', (ws) => {
        ws.on('message', async (message) => {
            const { type, payload } = JSON.parse(message.toString());

            if (type === 'join_quiz') {
                await handleJoinQuiz(ws, payload.quizId, payload.userId);
            } else if (type === 'submit_answer') {
                await handleSubmitAnswer(ws, payload, wss);
            }
        });
    });
};
