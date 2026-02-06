import { DataTypes, Model, Optional} from "sequelize";
import sequelize from "../database/db";
import { Message } from "./Messages";

interface ConversationAttributes {
    convo_id: string;
    user_id: string;
    title: string;
    category?: string;
    last_message_at: Date;
    is_archived: boolean;
    created_at?: Date;
    updated_at?: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'convo_id' | 'is_archived' | 'last_message_at'> {}

export class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
    public convo_id!: string;
    public user_id!: string;
    public title!: string;
    public category?: string;
    public last_message_at!: Date;
    public is_archived!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Conversation.init(
    {
        convo_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 'New Conversation'
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        last_message_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'last_message_at'
        },
        is_archived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_archived'
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
        tableName: 'conversations',
        timestamps: true,
        paranoid: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
  );

  export const setupChatAssociations = (User: any) => {
    // User has many Conversations
    User.hasMany(Conversation, {
        foreignKey: 'user_id',
        as: 'conversations',
        onDelete: 'CASCADE'
    });
    
    // Conversation belongs to User
    Conversation.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });
    
    // Conversation has many Messages
    Conversation.hasMany(Message, {
        foreignKey: 'convo_id',
        as: 'messages',
        onDelete: 'CASCADE'
    });
    
    // Message belongs to Conversation
    Message.belongsTo(Conversation, {
        foreignKey: 'convo_id',
        as: 'conversation'
    });
};

export default Conversation;