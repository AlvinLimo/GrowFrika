// backend/models/User.ts
import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../database/db'; // Your database config

interface UserAttributes {
    user_id: string;
    username: string;
    email: string;
    password?: string;
    googleId?: string;
    isGoogleUser: boolean;
    hasPassword: boolean;
    isVerified: boolean;
    verificationToken?: string;
    profilePicture?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'user_id' | 'googleId' | 'password' | 'profilePicture' | 'verificationToken'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare user_id: string;
    declare username: string;
    declare email: string;
    declare password?: string;
    declare googleId?: string;
    declare isGoogleUser: boolean;
    declare hasPassword: boolean;
    declare isVerified: boolean;
    declare verificationToken?: string;
    declare profilePicture?: string;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

User.init(
    {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true // Can be null for Google users who haven't set a password
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        isGoogleUser: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        hasPassword: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        verificationToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        profilePicture: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true
    }
);

export default User;