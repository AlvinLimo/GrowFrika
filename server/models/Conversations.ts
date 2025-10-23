import { DataTypes, Model} from "sequelize";
import sequelize from "../database/db";

class Conversation extends Model {
  public id!: number;
  public userId!: number;
  public messages!: string[];
}

Conversation.init(
  {
    conversation_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Conversations",
    tableName: "conversations",
    timestamps: true,
  }
);

export default Conversation;
