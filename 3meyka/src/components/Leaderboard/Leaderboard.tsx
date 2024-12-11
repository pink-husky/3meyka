import React, { useState, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from 'firebase/firestore';
import { CrownIcon } from 'lucide-react';
import { firestore } from '../../firebase.ts';
interface LeaderboardEntry {
    username: string;
    snakeHighScore: number;
}

const SnakeLeaderboard: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Create a query to get top 10 players by Snake high score
                const leaderboardQuery = query(
                    collection(firestore, 'users'),
                    orderBy('snakeHighScore', 'desc'),
                    limit(10)
                );

                // Execute the query
                const querySnapshot = await getDocs(leaderboardQuery);

                // Map results to LeaderboardEntry
                const topPlayers = querySnapshot.docs.map(doc => ({
                    username: doc.data().username,
                    snakeHighScore: doc.data().snakeHighScore || 0
                }));

                setLeaderboard(topPlayers);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="bg-black bg-opacity-50 text-green-500 rounded-lg p-8 w-[400px] h-[600px] backdrop-blur-sm border border-green-800 flex flex-col">
            <div className="flex items-center mb-4">
                <CrownIcon
                    className="mr-2 text-yellow-400"
                    size={24}
                    fill="currentColor"
                />
                <h2 className="text-2xl">Global Leaderboard</h2>
            </div>

            <div className="flex-grow overflow-auto">
                {leaderboard.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        No players yet
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-green-800">
                            <th className="text-left py-2">Rank</th>
                            <th className="text-left py-2">Username</th>
                            <th className="text-right py-2">High Score</th>
                        </tr>
                        </thead>
                        <tbody>
                        {leaderboard.map((player, index) => (
                            <tr
                                key={player.username}
                                className="border-b border-green-800/20 hover:bg-green-800/10"
                            >
                                <td className="py-2">
                                    {index + 1 === 1 ? '🥇' :
                                        index + 1 === 2 ? '🥈' :
                                            index + 1 === 3 ? '🥉' :
                                                `#${index + 1}`}
                                </td>
                                <td className="py-2">{player.username}</td>
                                <td className="py-2 text-right">
                                    {player.snakeHighScore}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-400 text-center">
                Updated in real-time
            </div>
        </div>
    );
};

export default SnakeLeaderboard;