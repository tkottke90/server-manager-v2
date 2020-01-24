import Application from './classes/application.class';
import proxy = require('http-proxy-middleware');

const app = new Application();

const logProvider = (provider: proxy.LogProvider) => {
    const logger = {
        log: app.logger.logMethod('info'),
        info: app.logger.logMethod('info'),
        debug: app.logger.logMethod('debug'),
        warn: app.logger.logMethod('warn'),
        error: app.logger.logMethod('error')
    };

    return logger;
};

app.express.use('/api', proxy({
    target: app.environment.API_URL,
    changeOrigin: true,
    logProvider,
    pathRewrite: { '^/api': '' }
}));

app.express.use('/', proxy({
    target: app.environment.UI_URL,
    changeOrigin: true,
    logProvider
}));

app.start();
