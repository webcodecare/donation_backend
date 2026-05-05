import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { seedAdmin } from './app/middlewares/seedAdmin';
import attachLang from './app/middlewares/attachLang';

const app = express();

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Content-Type, Authorization, Origin, X-Requested-With, Accept',
    credentials: true,
  }),
);
// sheeds
seedAdmin();

// attach selected language to req.lang (?lang= or Accept-Language)
app.use(attachLang);

// application routes
app.use('/api', router);



//global error handler
app.use(globalErrorHandler);

// handle not found routes
app.use(notFound);

export default app;
