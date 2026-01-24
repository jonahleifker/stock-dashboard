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
  declare profilePicture: CreationOptional<string | null>;
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
  declare change1y: CreationOptional<number | null>;
  declare marketCap: CreationOptional<number | null>;
  declare lastUpdated: CreationOptional<Date | null>;
  // Fundamentals
  declare pe: CreationOptional<number | null>;
  declare peg: CreationOptional<number | null>;
  declare eps: CreationOptional<number | null>;
  declare dividendYield: CreationOptional<number | null>;
  declare roe: CreationOptional<number | null>;
  declare netMargin: CreationOptional<number | null>;
  declare operatingMargin: CreationOptional<number | null>;
  declare cash: CreationOptional<number | null>;
  declare totalDebt: CreationOptional<number | null>;
  declare earningsDate: CreationOptional<Date | null>;
  declare exDividendDate: CreationOptional<Date | null>;
  declare targetPrice: CreationOptional<number | null>;
  declare recommendation: CreationOptional<string | null>;
  declare description: CreationOptional<string | null>;
  declare website: CreationOptional<string | null>;
  declare employees: CreationOptional<number | null>;
  declare news: CreationOptional<any[] | null>;
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
  profilePicture: { type: DataTypes.TEXT, allowNull: true },
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
  change1y: { type: DataTypes.FLOAT, allowNull: true },
  marketCap: { type: DataTypes.BIGINT, allowNull: true },
  lastUpdated: { type: DataTypes.DATE, allowNull: true },
  pe: { type: DataTypes.FLOAT, allowNull: true },
  peg: { type: DataTypes.FLOAT, allowNull: true },
  eps: { type: DataTypes.FLOAT, allowNull: true },
  dividendYield: { type: DataTypes.FLOAT, allowNull: true },
  roe: { type: DataTypes.FLOAT, allowNull: true },
  netMargin: { type: DataTypes.FLOAT, allowNull: true },
  operatingMargin: { type: DataTypes.FLOAT, allowNull: true },
  cash: { type: DataTypes.FLOAT, allowNull: true },
  totalDebt: { type: DataTypes.FLOAT, allowNull: true },
  earningsDate: { type: DataTypes.DATE, allowNull: true },
  exDividendDate: { type: DataTypes.DATE, allowNull: true },
  targetPrice: { type: DataTypes.FLOAT, allowNull: true },
  recommendation: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  website: { type: DataTypes.STRING, allowNull: true },
  employees: { type: DataTypes.INTEGER, allowNull: true },
  news: { type: DataTypes.JSON, allowNull: true },
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

export class EarningsReport extends Model<InferAttributes<EarningsReport>, InferCreationAttributes<EarningsReport>> {
  declare id: CreationOptional<number>;
  declare ticker: string;
  declare quarter: string;
  declare reportDate: Date;
  declare revenue: CreationOptional<number | null>;
  declare eps: CreationOptional<number | null>;
  declare notes: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

EarningsReport.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ticker: { type: DataTypes.STRING, allowNull: false },
  quarter: { type: DataTypes.STRING, allowNull: false },
  reportDate: { type: DataTypes.DATE, allowNull: false },
  revenue: { type: DataTypes.FLOAT, allowNull: true },
  eps: { type: DataTypes.FLOAT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, { sequelize, modelName: 'EarningsReport', tableName: 'earnings_reports', timestamps: true });

// ... existing imports ...

// ... existing models ...

export class Favorite extends Model<InferAttributes<Favorite>, InferCreationAttributes<Favorite>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare ticker: string;
  declare averagePrice: CreationOptional<number | null>;
  declare shares: CreationOptional<number | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export class Watchlist extends Model<InferAttributes<Watchlist>, InferCreationAttributes<Watchlist>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare ticker: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

// ... existing inits ...

Favorite.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  ticker: { type: DataTypes.STRING, allowNull: false },
  averagePrice: { type: DataTypes.FLOAT, allowNull: true },
  shares: { type: DataTypes.FLOAT, allowNull: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, {
  sequelize,
  modelName: 'Favorite',
  tableName: 'favorites',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'ticker']
    }
  ]
});

Watchlist.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  ticker: { type: DataTypes.STRING, allowNull: false },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
}, {
  sequelize,
  modelName: 'Watchlist',
  tableName: 'watchlist',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'ticker']
    }
  ]
});

// ... existing inits ...

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

Stock.hasMany(Favorite, { foreignKey: 'ticker', sourceKey: 'ticker' });
Favorite.belongsTo(Stock, { foreignKey: 'ticker', targetKey: 'ticker' });
Favorite.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Favorite, { foreignKey: 'userId' });

Stock.hasMany(Watchlist, { foreignKey: 'ticker', sourceKey: 'ticker' });
Watchlist.belongsTo(Stock, { foreignKey: 'ticker', targetKey: 'ticker' });
Watchlist.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Watchlist, { foreignKey: 'userId' });

Stock.hasMany(Article, { foreignKey: 'ticker', sourceKey: 'ticker' });
Article.belongsTo(Stock, { foreignKey: 'ticker', targetKey: 'ticker' });
Article.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Article, { foreignKey: 'userId' });

Stock.hasMany(ResearchFile, { foreignKey: 'ticker', sourceKey: 'ticker' });
ResearchFile.belongsTo(Stock, { foreignKey: 'ticker', targetKey: 'ticker' });
ResearchFile.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ResearchFile, { foreignKey: 'userId' });

Stock.hasMany(EarningsReport, { foreignKey: 'ticker', sourceKey: 'ticker' });
EarningsReport.belongsTo(Stock, { foreignKey: 'ticker', targetKey: 'ticker' });

export default { sequelize, User, Role, Permission, RefreshToken, Stock, Note, Article, ResearchFile, EarningsReport, Favorite, Watchlist };
