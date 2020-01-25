// tslint:disable: no-console

class EnvironmentService {
  public CWD: string;
  public ENVIRONMENT: string;
  public IS_DEVELOPMENT: boolean;
  public PORT: string;

  public DATABASE_NAME: string;
  public DATABASE_USER: string;
  public DATABASE_PASSWORD: string;
  public DATABASE_HOST: string;
  public DATABASE_PORT: number;
  public SECRET: string;
  public SALT: number;
  public TOKEN_LIFESPAN: string;

  constructor() {
    this.loadVariables();
  }

  private loadVariables() {
    console.log('=== Environment Variables ===\n');
    // Global Variables
    this.loadGlobalVariables();
    // Check if Production
    if (this.IS_DEVELOPMENT) {
      this.loadDevelopmentEnvironment();
    } else {
      this.loadProductionEnvironment();
    }

    console.log('\n=============================\n');
  }

  private loadDevelopmentEnvironment() {
    console.log('--- Development Variables ---');

    // Add development only variables here
  }

  private loadProductionEnvironment() {
    console.log('--- Production Variables ---');

    // Add production only variables here
  }

  private loadGlobalVariables() {
    console.log('--- Required Always -- ');

    this.ENVIRONMENT = this.loadVariable('NODE_ENV');
    this.PORT = this.loadVariable('PORT');
    this.CWD = process.cwd();
    this.IS_DEVELOPMENT = this.ENVIRONMENT === 'development';

    this.DATABASE_NAME = this.loadVariable('DATABASE_NAME');
    this.DATABASE_USER = this.loadVariable('DATABASE_USER');
    this.DATABASE_PASSWORD = this.loadSecretVariable('DATABASE_PASSWORD');
    this.DATABASE_HOST = this.loadVariable('DATABASE_HOST');
    this.DATABASE_PORT = Number.parseInt(this.loadVariable('DATABASE_PORT'), 10);
    this.SECRET = this.loadSecretVariable('SECRET');
    this.SALT = Number.parseInt(this.loadVariable('SALT'), 10);
    this.TOKEN_LIFESPAN = this.loadVariable('TOKEN_LIFESPAN');

    console.log('');
  }

  private loadVariable(name: string): string {
    const value: string = process.env[name];

    if (!value) {
      console.log(`  ${name}: !! ERROR !! - Required Variable not set`);
      process.exit(400);
    }

    console.log(`  ${name}: ${value}`);
    return value;
  }

  private loadSecretVariable(name: string): string {
    const value: string = process.env[name];

    if (!value) {
      console.log(`  ${name}: !! ERROR !! - Required Variable not set`);
      process.exit(400);
    }

    console.log(`  ${name}: set`);
    return value;
  }
}

export default new EnvironmentService();
