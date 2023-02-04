const { DataTypes } = require("sequelize");


module.exports = (sequalize) => {

    //definir el modelo generos

    sequalize.define('genre', {
        id :{
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    })

}