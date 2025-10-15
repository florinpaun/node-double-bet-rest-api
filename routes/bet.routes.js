import express from 'express';
import { listBets, addBet } from '../controllers/bet.controller.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Api Bet routes' });
});

router.get('/list', listBets);
router.post('/add', addBet);

export default router;