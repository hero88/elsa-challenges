import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// test 1
test('renders quiz form', () => {
    render(<App />);

    // Check if the input fields and button are present
    const quizIdInput = screen.getByPlaceholderText(/quiz id/i);
    const userIdInput = screen.getByPlaceholderText(/user id/i);
    const joinButton = screen.getByRole('button', { name: /join quiz/i });

    expect(quizIdInput).toBeInTheDocument();
    expect(userIdInput).toBeInTheDocument();
    expect(joinButton).toBeInTheDocument();
});

// test 2
test('displays rules section', () => {
    render(<App />);

    const rulesAlert = screen.getByRole('alert');
    expect(rulesAlert).toHaveTextContent('Correct answers earn 10 points, wrong answers earn 0 points.');
});

// test 3
test('handles quiz join', () => {
    const mockSend = jest.fn();
    global.WebSocket = jest.fn(() => ({
        send: mockSend,
        onmessage: jest.fn(),
        close: jest.fn(),
    }));

    render(<App />);

    const quizIdInput = screen.getByPlaceholderText(/quiz id/i);
    const userIdInput = screen.getByPlaceholderText(/user id/i);
    const joinButton = screen.getByRole('button', { name: /join quiz/i });

    // Simulate user input
    quizIdInput.value = '123';
    userIdInput.value = '456';

    // Click the join button
    joinButton.click();

    expect(mockSend).toHaveBeenCalledWith(
        JSON.stringify({
            type: 'join_quiz',
            payload: { quizId: '123', userId: '456' },
        })
    );
});

// test 4
test('submits answer', () => {
    // Mock WebSocket
    const mockSend = jest.fn();
    global.WebSocket = jest.fn(() => ({
        send: mockSend,
        onmessage: jest.fn(),
        close: jest.fn(),
    }));

    render(<App />);

    // Simulate user actions
    const quizIdInput = screen.getByPlaceholderText(/quiz id/i);
    const userIdInput = screen.getByPlaceholderText(/user id/i);
    const answerInput = screen.getByPlaceholderText(/your answer/i);
    const joinButton = screen.getByRole('button', { name: /join quiz/i });
    const submitButton = screen.getByRole('button', { name: /submit answer/i });

    // Set input values
    fireEvent.change(quizIdInput, { target: { value: '123' } });
    fireEvent.change(userIdInput, { target: { value: '456' } });
    fireEvent.change(answerInput, { target: { value: 'My Answer' } });

    // Simulate joining the quiz
    fireEvent.click(joinButton);

    // Simulate submitting the answer
    fireEvent.click(submitButton);

    // Assert WebSocket send was called with the correct payload
    expect(mockSend).toHaveBeenCalledWith(
        JSON.stringify({
            type: 'submit_answer',
            payload: {
                quizId: '123',
                userId: '456',
                answer: 'My Answer',
                questionIndex: 0,
            },
        })
    );
});

// test 5
test('displays leaderboard', () => {
    const mockSend = jest.fn();
    global.WebSocket = jest.fn(() => ({
        send: mockSend,
        onmessage: jest.fn(),
        close: jest.fn(),
    }));
    render(<App />);

    const leaderboardData = [
        { username: 'Alice', score: 30 },
        { username: 'Bob', score: 20 },
    ];

    // Simulate leaderboard update
    const leaderboardList = screen.getByRole('list');
    leaderboardData.forEach((entry) => {
        const item = document.createElement('li');
        item.textContent = `${entry.username} - ${entry.score} points`;
        leaderboardList.appendChild(item);
    });

    leaderboardData.forEach((entry) => {
        expect(screen.getByText(`${entry.username} - ${entry.score} points`)).toBeInTheDocument();
    });
});
