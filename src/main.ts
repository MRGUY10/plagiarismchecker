import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http';

// Modify the appConfig to include HttpClientModule in imports
const updatedAppConfig = {
  ...appConfig,
  imports: [
    HttpClientModule,      // Add HttpClientModule here
  ],
};

bootstrapApplication(AppComponent, updatedAppConfig)
  .catch((err) => console.error(err));
