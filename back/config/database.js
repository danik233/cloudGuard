const { MongoClient } = require('mongodb');

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const uri = process.env.MONGO_URI;

      this.client = new MongoClient(uri);
      await this.client.connect();

        this.db = this.client.db('cloudguard');
        await this.db.collection('ping').insertOne({ createdAt: new Date(), from: 'cloudguard-backend' });
        console.log('Database: Wrote ping document to cloudguard.ping');


      console.log('Database: Connected to MongoDB Atlas');
    } catch (error) {
      console.error('Database connection failed:', error.message);
      process.exit(1);
    }
  }

  getDB() {
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
  }
}

module.exports = new Database();
