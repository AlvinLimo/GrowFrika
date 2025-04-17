import sequelize from '../database/db'
import { DataTypes } from 'sequelize'

const User = sequelize.define('User',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt:{
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt:{
        type: DataTypes.DATE,
        allowNull: false,
    }
},{
    tableName: 'users'
})

export default User