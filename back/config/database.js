class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    // MongoDB connection will be implemented here
    console.log('Database: Using in-memory storage');
  }

  
  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
  }
}

module.exports = new Database();