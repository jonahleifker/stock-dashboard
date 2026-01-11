import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from 'sequelize';
import sequelize from '../db/sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: CreationOptional<string | null>;
  declare passwordHash: string;
  declare displayName: CreationOptional<string | null>;
  declare firstName: CreationOptional<string | null>;
  declare lastName: CreationOptional<string | null>;
  declare isActive: CreationOptional<boolean>;
  declare lastLoginAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export class Permission extends Model<InferAttributes<Permission>, InferCreationAttributes<Permission>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare tokenHash: string;
  declare jti: string;
  declare revokedAt: CreationOptional<Date | null>;
  declare expiresAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export class Stock extends Model<InferAttributes<Stock>, InferCreationAttributes<Stock>> {
  declare ticker: string;
  declare companyName: CreationOptional<string | null>;
  declare sector: CreationOptional<string | null>;
  declare currentPrice: CreationOptional<number | null>;
  declare high30d: CreationOptional<number | null>;
  declare high3mo: CreationOptional<number | null>;
  declare high6mo: CreationOptional<number | null>;
  declare high1yr: CreationOptional<number | null>;
  declare change7d: CreationOptional<number | null>;
  declare change30d: CreationOptional<number | null>;
  declare change90d: CreationOptional<number | null>;
  declare marketCap: CreationOptional<number | null>;
  declare lastUpdated: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export class Note extends Model<InferAttributes<Note>, InferCreationAttributes<Note>> {
  declare id: CreationOptional<number>;
  declare ticker: string;
  declare userId: number;
  declare bullCase: CreationOptional<string | null>;
  declare bearCase: CreationOptional<string | null>;
  declare buyInPrice: CreationOptional<number | null>;
  declare currentStance: CreationOptional<'bullish' | 'bearish' | 'neutral' | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export class Article extends Model<InferAttributes<Article>, InferCreationAttributes<Article>> {
  declare id: CreationOptional<number>;
  declare ticker: string;
  declare userId: number;
  declare title: string;
  declare url: string;
  declare sourceName: CreationOptional<string | null>;
  declare publishedAt: CreationOptional<Date | null>;
  declare addedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export class ResearchFile extends Model<InferAttributes<ResearchFile>, InferCreationAttributes<ResearchFile>> {
  declare id: CreationOptional<number>;
  declare ticker: string;
  declare userId: number;
  declare filename: string;
  declare fileType: string;
  declare supabasePath: string;
  declare fileSize: CreationOptional<number | null>;
  declare source: CreationOptional<'manual' | 'manus'>;
  declare uploadedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: true, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  displayName: { type: DataTypes.STRING, allowNull: true },
  firstName: { type: DataTypes.STRING, allowNull: true },
  lastName: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  lastLoginAt: { type: DataTypes.DATE, allowNull: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, { sequelize, modelName: 'User', tableName: 'Users', timestamps: true });

Role.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, { sequelize, modelName: 'Role', tableName: 'Roles', timestamps: true });

Permission.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, { sequelize, modelName: 'Permission', tableName: 'Permissions', timestamps: true });

RefreshToken.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  tokenHash: { type: DataTypes.STRING, allowNull: false },
  jti: { type: DataTypes.STRING, allowNull: false, unique: true },
  revokedAt: { type: DataTypes.DATE, allowNull: true },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, { sequelize, modelName: 'RefreshToken', tableName: 'RefreshTokens', timestamps: true });

Stock.init({
  ticker: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
  companyName: { type: DataTypes.STRING, allowNull: true },
  sector: { type: DataTypes.STRING, allowNull: true },
  currentPrice: { type: DataTypes.FLOAT, allowNull: true },
  high30d: { type: DataTypes.FLOAT, allowNull: true },
  high3mo: { type: DataTypes.FLOAT, allowNull: true },
  high6mo: { type: DataTypes.FLOAT, allowNull: true },
  high1yr: { type: DataTypes.FLOAT, allowNull: true },
  change7d: { type: DataTypes.FLOAT, allowNull: true },
  change30d: { type: DataTypes.FLOAT, allowNull: true },
  change90d: { type: DataTypes.FLOAT, allowNull: true },
  marketCap: { type: DataTypes.BIGINT, allowNull: true },
  lastUpdated: { type: DataTypes.DATE, allowNull: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, { sequelize, modelName: 'Stock', tableName: 'stocks', timestamps: true });

Note.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ticker: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  bullCase: { type: DataTypes.TEXT, allowNull: true },
  bearCase: { type: DataTypes.TEXT, allowNull: true },
  buyInPrice: { type: DataTypes.FLOAT, allowNull: true },
  currentStance: { type: DataTypes.ENUM('bullish', 'bearish', 'neutral'), allowNull: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, { sequelize, modelName: 'Note', tableName: 'notes', timestamps: true });

Article.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ticker: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  sourceName: { type: DataTypes.STRING, allowNull: true },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
  addedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, { sequelize, modelName: 'Article', tableName: 'articles', timestamps: true });

ResearchFile.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ticker: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  filename: { type: DataTypes.STRING, allowNull: false },
  fileType: { type: DataTypes.STRING, allowNull: false },
  supabasePath: { type: DataTypes.STRING, allowNull: false },
  fileSize: { type: DataTypes.INTEGER, allowNull: true },
  source: { type: DataTypes.ENUM('manual', 'manus'), allowNull: true, defaultValue: 'manual' },
  uploadedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, { sequelize, modelName: 'ResearchFile', tableName: 'research_files', timestamps: true });

// Associations
User.belongsToMany(Role, { through: 'UserRoles', foreignKey: 'userId' });
Role.belongsToMany(User, { through: 'UserRoles', foreignKey: 'roleId' });

Role.belongsToMany(Permission, { through: 'RolePermissions', foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: 'RolePermissions', foreignKey: 'permissionId' });

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// Stock dashboard associations
Stock.hasMany(Note, { foreignKey: 'ticker', sourceKey: 'ticker' });
Note.belongsTo(Stock, { foreignKey: 'ticker', targetKey: 'ticker' });
Note.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Note, { foreignKey: 'userId' });

Stock.hasMany(Article, { foreignKey: 'ticker', sourceKey: 'ticker' });
Article.belongsTo(Stock, { foreignKey: 'ticker', targetKey: 'ticker' });
Article.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Article, { foreignKey: 'userId' });

Stock.hasMany(ResearchFile, { foreignKey: 'ticker', sourceKey: 'ticker' });
ResearchFile.belongsTo(Stock, { foreignKey: 'ticker', targetKey: 'ticker' });
ResearchFile.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ResearchFile, { foreignKey: 'userId' });

export default { sequelize, User, Role, Permission, RefreshToken, Stock, Note, Article, ResearchFile };
