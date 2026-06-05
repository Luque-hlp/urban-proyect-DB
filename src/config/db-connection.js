const { Sequelize } = require('sequelize');
const config = require('./database');

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    ...(dbConfig.ssl && {
      ssl: true,
      dialectOptions: dbConfig.dialectOptions
    })
  }
);

// Probar conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('✗ Error al conectar con la base de datos:', error.message);
    throw error;
  }
};

// Sincronizar modelos (solo para desarrollo)
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✓ Modelos sincronizados correctamente.');
  } catch (error) {
    console.error('✗ Error al sincronizar modelos:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncModels,
  Sequelize
};
