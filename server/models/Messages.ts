import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/db';

interface MessageAttributes {
    message_id: string;
    convo_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    image_urls?: string[];
    metadata?: object;
    created_at?: Date;
    updated_at?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'message_id' | 'image_urls' | 'metadata'> {}

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
    public message_id!: string;
    public convo_id!: string;
    public role!: 'user' | 'assistant' | 'system';
    public content!: string;
    public image_urls?: string[];
    public metadata?: object;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Message.init(
    {
        message_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            field: 'message_id'
        },
        convo_id: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'convo_id',
            references: {
                model: 'conversations',
                key: 'convo_id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        role: {
            type: DataTypes.ENUM('user', 'assistant', 'system'),
            allowNull: false,
            validate: {
                isIn: [['user', 'assistant', 'system']]
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image_urls: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
            defaultValue: [],
            field: 'image_urls'
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        },
        created_at: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        updated_at: {
            type: DataTypes.DATE,
            field: 'updated_at'
        }
    },
    {
        sequelize,
        tableName: 'messages',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

export default Message;