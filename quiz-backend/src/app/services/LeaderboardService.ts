import { AppDataSource } from "../../config/data-source";
import { redisClient } from "../../config/redisClient";
import { Leaderboard } from "../../entity/Leaderboard";

export class LeaderboardService {
    private leaderboardRepository = AppDataSource.getRepository(Leaderboard);

    /**
     * Retrieves the leaderboard for a specific quiz identified by quizId.
     * First checks the Redis cache for the leaderboard data. If not found in cache,
     * it fetches the leaderboard from the database, orders the entries by score in descending order,
     * and caches the result in Redis for future requests.
     * @param {number} quizId - The ID of the quiz for which the leaderboard is to be retrieved.
     * @returns {Promise<Leaderboard[]>} A promise that resolves to an array of leaderboard entries,
     * each containing user details and scores.
     */
    async getLeaderboard(quizId: number) {
        // Check Redis cache first
        const cachedLeaderboard = await redisClient.get(`leaderboard:${quizId}`);
        if (cachedLeaderboard) {
            return JSON.parse(cachedLeaderboard);
        }

        // Fetch from database if not cached
        const leaderboard = await this.leaderboardRepository.find({
            where: { quiz: { quiz_id: quizId } },
            relations: ['user'],
            order: { score: 'DESC' },
        });

        // Cache the result
        await redisClient.set(`leaderboard:${quizId}`, JSON.stringify(leaderboard), { EX: 10 }); // Cache for 10 seconds
        return leaderboard;
    }
}
