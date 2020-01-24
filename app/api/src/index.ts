import Application from './classes/application.class';
import routes from './routes/index';

const app = new Application({ logHttp: 'on' });

routes(app);

app.start();
