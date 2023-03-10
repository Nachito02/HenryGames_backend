
    const {Videogame, Genre} = require('../db.js')
    require('dotenv').config()
const axios = require('axios');
    exports.getGames = async (req,res,next)=> {

        try {
            let games = [];

            const result =   await  Videogame.findAll({
                attibutes: ['videogames'],
                include:[
                {
                    model: Genre,
                    attibutes: ['name']
                }

                ]
            })

            for (let page = 1; page <=5; page++) {
              const response = await axios.get(`https://api.rawg.io/api/games?page=${page}&key=${process.env.API_KEY}`);
              games = [...games, ...response.data.results];
            }
            let gamesFiltrados = games.map( (e) => {

                const objeto  = {
                    id: e.id,
                    name: e.name,
                    description:e.description,
                    platforms: e.platforms,
                    background_image: e.background_image,
                    rating: e.rating,
                    genres: e.genres,
                    released: e.released

                }
                return  objeto
             } ) 

             if(result.length > 0) {
                let resultObject = {};
                result.forEach(result => {

                  resultObject = result.dataValues;

                    resultObject.platforms = result.platforms.map(e => (
                         {platform : {name : e}}
                    ) )

                  gamesFiltrados.push(resultObject)
                });
             }
            res.status(200).json(gamesFiltrados);


          } catch (error) {
            console.error(error);
    }


    }
    exports.addGame = async (req,res,next) => {

        try {
          const videogame = await Videogame.create({
                name : req.body.name,
                description_raw: req.body.description,
                released: req.body.released,
                rating : req.body.rating,
                platforms: req.body.platforms,
                background_image: req.body.background_image
            })

             // Busca los g??neros
             const genres = await Promise.all(req.body.genres.map(async (name) => {
                const existingGenre = await Genre.findOne({ where: { name } });
                return existingGenre;
              }));

            //asociar genero con video juego
            await videogame.addGenres(genres);

            const resultado = await Videogame.findOne({where: {name: req.body.name},include: [{
                model: Genre,
                attributes: ['name']
              }]})

        res.status(200).json(resultado.dataValues);
              
    
    } catch (error) {
            console.log(error)
        }



    }

    exports.getGame= async (req,res,next) => {
        const {id} = req.params;

        if(id.length < 8) {
            try {
                const respuesta = await axios.get(`https://api.rawg.io/api/games/${id}?key=${process.env.API_KEY}`)
    
    
                        const gamesFiltrados = {
                            id: respuesta.data.id,
                            name: respuesta.data.name,
                            description_raw:respuesta.data.description_raw,
                            platforms: respuesta.data.platforms,
                            background_image: respuesta.data.background_image,
                            rating: respuesta.data.rating,
                            genres: respuesta.data.genres,
                            released: respuesta.data.released
                        }
    
                         res.status(200).json(gamesFiltrados)
            } catch (error) {
                console.log(error)
            }
        } else {
            try {
                const game = await Videogame.findOne({ where: {
                    id
                  },
                  include: [{
                    model: Genre,
                    attributes: ['name']
                  }]})

                  game.platforms = game.platforms.map(e => (
                    {platform : {name : e}}
                ) )

                res.json(game)
            } catch (error) {
                console.log(error)
            }
        }

       
    }



    exports.getGenres = async(req,res,next) => {

            const genres = await Genre.findAll()

            res.status(200).json(genres)
    }


    exports.searchGame = async (req,res,next) => {

        const {game} = req.params
       try {
        const respuesta = await axios.get(`https://api.rawg.io/api/games?search=${game}&key=${process.env.API_KEY}`)
        res.status(200).json(respuesta.data.results)
       } catch (error) {
        console.log(error)
       }
        
    }


        exports.deleteGame = async(req,res,next) => { 

            const {id} = req.params

            try {

                const game = await Videogame.findOne({ where: {
                    id
                  },
                  include: [{
                    model: Genre,

                    through: {
                        where: {
                            videogameid: id
                        }
                    }

                  }]})

                

                   const response = await Videogame.destroy({
                        where: {
                            id: id
                        },
                        include: [
                            {
                                model: Genre,
                                through: {
                                    where: {
                                        videogameid: id
                                    }
                                }

                            }
                        ]
                    })

                    res.status(200).json(game.dataValues)
            } catch(error) {
                console.log(error)
            }
         }