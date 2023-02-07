const { Router } = require('express');
const { route } = require('../app.js');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const gamesController = require('../controllers/gamesController.js')

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.get('/videogames', gamesController.getGames)

router.get('/videogame/:id', gamesController.getGame)


router.post('/videogames', gamesController.addGame)

router.get('/genres', gamesController.getGenres)

router.get('/videogame/search/:game', gamesController.searchGame)


module.exports = router;
