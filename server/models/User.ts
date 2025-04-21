import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/db';

interface UserAttributes {
    id?: string;
    username: string;
    email: string;
    password?: string;
    googleId?: string;
}

class User extends Model<UserAttributes>{}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        googleId:{
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        }
    },
    {
        sequelize,
        tableName: 'users',
        modelName: 'User'
    }
);

export default User;