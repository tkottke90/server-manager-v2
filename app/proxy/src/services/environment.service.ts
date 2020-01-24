// tslint:disable: no-console

class EnvironmentService {
  public CWD: string;
  public ENVIRONMENT: string;
  public IS_DEVELOPMENT: boolean;
  public PORT: string;

  public API_URL: string;
  public UI_URL: string;

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

    this.API_URL = this.loadVariable('API_URL');
    this.UI_URL = this.loadVariable('UI_URL');

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
