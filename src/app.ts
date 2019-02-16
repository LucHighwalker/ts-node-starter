import * as express from 'express';
import * as mongoose from 'mongoose';

import Auth from './auth/auth.routes';

class App {
  public express;

  constructor() {
    this.express = express();
    this.connectDb();
    this.mountRoutes();
  }

  private connectDb(): void {
    const mongo = process.env.MONGO_URL;
    mongoose.connect(mongo, {
      useNewUrlParser: true,
      useCreateIndex: true
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB Connection error'));
  }

  private mountRoutes(): void {
    this.express.use('/auth', Auth);
  }
}

export default new App().express;
