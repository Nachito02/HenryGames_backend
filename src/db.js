const { Sequelize } = require('sequelize');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  DB_USER, DB_PASSWORD, DB_HOST,
  DATABASE_URL,
  PGUSER,
  PGDATABASE,
  PGPASSWORD,PGHOST,PGPORT
} = process.env;

const  axios = require('axios')

const sequelize = new Sequelize(`postgresql://${ PGUSER }:${ PGPASSWORD }@${ PGHOST }:${ PGPORT }/${ PGDATABASE }`, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Videogame, Genre } = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);

Videogame.belongsToMany(Genre, {
  through: 'videogame_genre',
  foreignKey: 'videogameid',
  otherKey: 'genreid'
})


Genre.belongsToMany(Videogame, {
  through: 'videogame_genre',
  foreignKey: 'genreid',
  otherKey: 'videogameid'
})


const precarga = async () => {

  try {
    const respuesta = await axios.get(`https://api.rawg.io/api/genres?key=${process.env.API_KEY}`)
    
    await respuesta.data.results.map(e=> 
         Genre.findOrCreate({
                where: {
                  name: e.name
                },
                defaults: {
                  name: e.name
                }
            })
        )
  }
  catch(e){
        console.log(e)
  }
  }
  

precarga()


module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,  precarga   // para importart la conexión { conn } = require('./db.js');
};
