
    const {Videogame, Genre} = require('../db.js')

const axios = require('axios');
const { json } = require('body-parser');
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
                    genres: e.genres
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

                    console.log(resultObject)
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
                relase_date: req.body.relase_date,
                rating : req.body.rating,
                platforms: req.body.platforms,
                background_image: req.body.background_image
            })

             // Busca los géneros
             const genres = await Promise.all(req.body.genreName.map(async (name) => {
                const existingGenre = await Genre.findOne({ where: { name } });
                return existingGenre;
              }));

            //asociar genero con video juego
            await videogame.addGenres(genres);
        res.status(200).json({msg: 'Video juego agregado correctamente'});
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
                            genres: respuesta.data.genres
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

            console.log(genres)

            res.status(200).json(genres)
    }
