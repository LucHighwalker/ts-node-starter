import * as express from 'express'

import Auth from './auth/auth.routes';

class Routes {
  public express

  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    const auth = new Auth().router;
    this.express.use('/auth', auth);
  }
}

export default new Routes().express