import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  MatButtonModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ContainerComponent} from './components/container/container.component';
import {CanvasComponent} from './components/canvas/canvas.component';
import {ToolboxComponent} from './components/toolbox/toolbox.component';
import {GenerateConfigurationComponent} from './components/generate-configuration/generate-configuration.component';

@NgModule({
  declarations: [
    AppComponent,
    ContainerComponent,
    CanvasComponent,
    ToolboxComponent,
    GenerateConfigurationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [GenerateConfigurationComponent]
})
export class AppModule {
}
