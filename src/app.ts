import express, {Request, Response, NextFunction} from 'express';
let mustacheExpress = require('mustache-express');
import mainRoutes from './routes/main-routes';   // Route connected
const app = express();
require('dotenv').config()
app.use(express.urlencoded());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'mustache');
app.engine('mustache', mustacheExpress());

app.use('/', mainRoutes);// This means all route path preceed this path

// Below route is trigerred when any error is is thrown
app.use((err: Error, req: Request, res:Response, next: NextFunction) => {
  res.status(500).json({message: err.message});
});
app.listen(process.env.PORT ? process.env.PORT : 3000);
