import Config from "../../../plugins/xiu-plugin/lib/config.js";
import mysql from "mysql2/promise";

const dbConfig = {
  host: Config.dataBase_Target,
  port: Config.dataBase_Post,
  user: Config.dataBase_User,
  password: Config.dataBase_PassWord,
  database: Config.dataBase_Name,
};

class Database {
  static instance = null;

  constructor(config = dbConfig) {
    if (Database.instance) return Database.instance; // 返回单例实例

    this.config = config;
    this.connection = null;
    Database.instance = this;
    this.connect(); // 自动连接
  }

  async connect() {
    if (!this.connection) {
      try {
        this.connection = await mysql.createConnection(this.config);
        console.log("Database connected successfully");
        this.connection.on("error", async (err) => {
          console.error("Database connection error:", err.message);
          this.connection = null;
          await this.connect(); // 自动重连
        });
      } catch (error) {
        console.error("Database connection failed:", error.message);
        throw error;
      }
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log("Database connection closed");
    }
  }

  async query(sql, params = []) {
    await this.connect();
    try {
      const [results] = await this.connection.execute(sql, params);
      return results;
    } catch (error) {
      console.error("Query execution error:", error.message);
      throw error;
    }
  }
}

export default new Database(); // 导出单例
