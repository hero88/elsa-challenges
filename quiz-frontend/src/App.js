import React, { useState, useEffect } from 'react';

const App = () => {
    const [quizId, setQuizId] = useState('');
    const [userId, setUserId] = useState('');
    const [answer, setAnswer] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [ws, setWs] = useState(null);
    const [question, setQuestion] = useState(null); // Current question
    const [loadingQuestion, setLoadingQuestion] = useState(false); // Question loading state
    const [questionIndex, setQuestionIndex] = useState(0); // Tracks the current question index
    const [hasSubmitted, setHasSubmitted] = useState(false); // Tracks if the user has submitted an answer
    const [hasJoined, setHasJoined] = useState(false); // Tracks if the user has joined a quiz

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8081');
        setWs(socket);

        socket.onmessage = (event) => {
            const { type, payload } = JSON.parse(event.data);

            if (type === 'leaderboard_update') {
                setLeaderboard(payload.formattedLeaderboard);
            }
        };

        return () => socket.close();
    }, []);

    /**
     * Joins a quiz and sends a WebSocket message to the server.
     * If the server responds with a 'quiz_joined' message, an alert is shown and the first question is fetched.
     * If the server responds with an 'error' message, an alert with the error message is shown.
     */
    const joinQuiz = () => {
        ws.send(JSON.stringify({ type: 'join_quiz', payload: { quizId, userId } }));
        ws.onmessage = (event) => {
            const { type, payload } = JSON.parse(event.data);

            if (type === 'quiz_joined') {
                setHasJoined(true);
                fetchQuestion(0); // Fetch the first question when the quiz is joined
            } else if (type === 'error') {
                alert(`Error: ${payload}`);
            }
        };
    };

    /**
     * Sends the user's answer to the server and clears the answer input.
     * Also prevents further submissions for the same question.
     */
    const submitAnswer = () => {
        ws.send(
            JSON.stringify({
                type: 'submit_answer',
                payload: { quizId, userId, answer, questionIndex },
            })
        );

        ws.onmessage = (event) => {
            const { type, payload } = JSON.parse(event.data);

            if (type === 'leaderboard_update') {
                // Clear the answer input after submission
                setAnswer('');
                setHasSubmitted(true); // Prevent further submissions for this question
                setLeaderboard(payload.formattedLeaderboard);
            } else if (type === 'error') {
                alert(`Error: ${payload}`);
            }
        };
    };

    /**
     * Fetches a question from the server at the given index.
     * If the server responds with a 200 status code, the question text is updated and the submission status is reset.
     * If the server responds with a non-200 status code, an alert is shown with the error message.
     * If an error occurs while making the request, the question text is set to an error message.
     * @param {number} index The index of the question to fetch.
     */
    const fetchQuestion = async (index) => {
        if (!quizId) {
            alert('Please enter a Quiz ID.');
            return;
        }

        setLoadingQuestion(true);
        try {
            const response = await fetch(`http://localhost:8080/quizzes/${quizId}/questions?index=${index}`);
            if (response.ok) {
                const data = await response.json();
                setQuestion(data.question_text);
                setQuestionIndex(index);
                setHasSubmitted(false); // Reset submission status for the new question
            } else {
                setQuestion('No more questions available.');
            }
        } catch (error) {
            console.error('Failed to fetch question:', error);
            setQuestion('Failed to fetch question.');
        } finally {
            setLoadingQuestion(false);
        }
    };

    /**
     * Fetches the next question from the server.
     * This function is called when the user clicks the "Next" button.
     */
    const nextQuestion = () => {
        fetchQuestion(questionIndex + 1);
    };

    return (
        <div className="container my-5 d-flex justify-content-center">
            <div className="w-100 w-md-50">
                <h1 className="text-center mb-4">Real-Time Quiz</h1>

                {/* Rules Section */}
                <div className="alert alert-info text-center" role="alert">
                    Correct answers earn <strong>10 points</strong>, wrong answers earn <strong>0 points</strong>.
                </div>

                {/* Join Quiz Section */}
                <div className="mb-4">
                    <div className="row">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Quiz ID"
                                value={quizId}
                                onChange={(e) => setQuizId(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="User ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className="btn btn-primary mt-3 w-100"
                        onClick={joinQuiz}
                        disabled={hasJoined} // Disable button if the user is already joined
                    >
                        Join Quiz
                    </button>
                </div>

                {/* Question Section */}
                <div className="mb-4">
                    {loadingQuestion ? (
                        <p className="text-center">Loading question...</p>
                    ) : (
                        question && (
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Question</h5>
                                    <p className="card-text">{question}</p>
                                    <button className="btn btn-secondary" onClick={nextQuestion}>
                                        Next Question
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Submit Answer Section */}
                <div className="mb-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Your Answer"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                    <button className="btn btn-success mt-3 w-100"
                        onClick={submitAnswer}
                        disabled={hasSubmitted} // Disable button if the answer is already submitted
                    >
                        Submit Answer
                    </button>
                </div>

                {/* Leaderboard Section */}
                <h2 className="text-center">Leaderboard</h2>
                <ul className="list-group">
                    {leaderboard.map((entry, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between">
                            <span>{entry.username}</span>
                            <span className="text-success">{entry.score} points</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default App;
