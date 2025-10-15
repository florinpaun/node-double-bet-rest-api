import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createOfflineAddGameTX, broadcastTransaction, getChainId } from './utils/utils.js';
import gameRoutes from './routes/game.routes.js';
import betRoutes from './routes/bet.routes.js';
import contractRoutes from './routes/contract.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/games', gameRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/contracts', contractRoutes);

const port = process.env.PORT || 3006;

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the DoubleBet API' });
});

app.post('/createOfflineAddGameTX', async (req, res) => {
    const { name, description, outcomes, closingTime } = req.body;

    if (!name || !description || !outcomes || !closingTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const tx = await createOfflineAddGameTX(name, description, outcomes, closingTime);
        res.status(200).json({ tx: tx });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/broadcastTransaction', async (req, res) => {
    const { signedTx } = req.body;

    if (!signedTx) {
        return res.status(400).json({ error: 'Missing signedTx field' });
    }

    try {
        const receipt = await broadcastTransaction(signedTx);
        res.status(200).json({ receipt: receipt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/chainId', async (req, res) => {
    try {
        const chainId = await getChainId();
        res.status(200).json({ chainId: Number(chainId) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


