import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  MatButtonModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatSliderModule
} from '@angular/material';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ContainerComponent} from './components/container/container.component';
import {CanvasComponent} from './components/canvas/canvas.component';
import {ToolboxComponent} from './components/toolbox/toolbox.component';
import {GenerateConfigurationComponent} from './components/generate-configuration/generate-configuration.component';
import {ConsoleComponent} from './components/console/console.component';

@NgModule({
  declarations: [
    AppComponent,
    ContainerComponent,
    CanvasComponent,
    ToolboxComponent,
    GenerateConfigurationComponent,
    ConsoleComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [GenerateConfigurationComponent]
})
export class AppModule {
}
