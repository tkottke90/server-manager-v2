import Application from './classes/application.class';
import routes from './routes/index';

const app = new Application({ logHttp: 'on' });

app.registerRoutes(routes);

app.start();
