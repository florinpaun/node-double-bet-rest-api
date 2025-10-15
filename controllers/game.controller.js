import { contract, provider, contractAbi, wallet } from '../utils/utils.js';

export const listGames = async (req, res) => {
    try {
        const games = await contract.listGames();
        let availableGames = [];
        for (let game of games) {
            availableGames.push({
                gameId: game[0].toString(),
                name: game[1],
                description: game[2],
                status: game[3].toString(),
                closingTime: new Date(Number(game[4]) * 1000).toISOString(),
                validated: game[5].toString(),
                outcomes: game[6].toString()
            });
        }
        res.status(200).json(availableGames);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const addGame = async (req, res) => {
    try {
        const { name, description, closingTime } = req.body;
        // Validate inputs
        if (!name || !description || !closingTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (closingTime <= currentTime) {
            return res.status(400).json({ error: "Closing time must be in the future" });
        }

        // Call addGame function
        console.log("Adding game to contract...");
        const tx = await contract.addGame(name, description, closingTime);

        console.log("Transaction sent:", tx.hash);
        console.log("Waiting for confirmation...");

        // Wait for transaction to be mined
        const receipt = await tx.wait();

        console.log("Game added successfully!");
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        const jsonResponse = {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };
        res.status(200).json(jsonResponse);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const closeGame = async (req, res) => {
    try {
        const { gameId } = req.body;
        if (!gameId) {
            return res.status(400).json({ error: 'Missing gameId field' });
        }

        const tx = await contract.closeGame(gameId);
        console.log("Transaction sent:", tx.hash);
        console.log("Waiting for confirmation...");

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log("Game closed successfully!");
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        const jsonResponse = {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };
        res.status(200).json(jsonResponse);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

