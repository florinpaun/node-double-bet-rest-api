import express from 'express';
import { fundContract, contractBalance } from '../controllers/contract.controller.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Api Bet routes' });
});

router.post('/fund', fundContract);
router.get('/balance', contractBalance);

export default router;