import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';

import Auth from './auth/auth.routes';

class Server {
  public server;

  constructor() {
    this.server = express();
    this.connectDb();
    this.applyMiddleware();
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

  private applyMiddleware(): void {
    this.server.use(bodyParser.json());
    this.server.use(bodyParser.urlencoded({ extended: true }));
  }

  private mountRoutes(): void {
    this.server.use('/auth', Auth);
  }
}

export default new Server().server;
