import * as express from 'express';

import Controller from './auth.controller';

import User from '../models/user';

class Auth {
  public router: express.Router;

  constructor() {
    this.router = express.Router();

    this.router.route('/');

    this.router.post('/signup', (req, res) => {
      const body = req.body;
      console.log('body; ', body);
      const user = new User(body);
      user.save().then(() => {
        res.json({
          user
        });
      });
    });
  }
}

export default new Auth().router;
