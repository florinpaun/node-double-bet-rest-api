import { contractWithBettor, provider, contractAbi, walletBettor, ethToWei } from '../utils/utils.js';

export const listBets = async (req, res) => {
    try {
        const bets = await contractWithBettor.listBets();
        let availableBets = [];
        for (let bet of bets) {
            availableBets.push({
                betId: bet[0].toString(),
                gameId: bet[1].toString(),
                user: bet[2],
                amount: bet[3].toString(),
                outcome: bet[4].toString(),
                status: bet[5].toString()
            });
        }
        res.status(200).json(availableBets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const addBet = async (req, res) => {
    try {
        const { gameId, amount, outcome } = req.body;

        if (!gameId || !amount || !outcome) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const betAmountWei = ethToWei(amount);

        const tx = await contractWithBettor.placeBet(gameId, outcome, { value: betAmountWei });

        console.log(`Transaction sent: ${tx.hash}`);
        console.log('Waiting for confirmation...');

        // Wait for transaction to be mined
        const receipt = await tx.wait();

        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        res.status(200).json({
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


