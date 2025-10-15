import express from 'express';
import { listGames, addGame, closeGame } from '../controllers/game.controller.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Api Game routes' });
});

router.get('/list', listGames);
router.post('/add', addGame);
router.post('/close', closeGame);

//router.post('/add', addGame
export default router;