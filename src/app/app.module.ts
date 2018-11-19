import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {
  MatButtonModule,
  MatDialogModule
} from '@angular/material';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ContainerComponent} from './components/container/container.component';
import {CanvasComponent} from './components/canvas/canvas.component';
import {ToolboxComponent} from './components/toolbox/toolbox.component';

@NgModule({
  declarations: [
    AppComponent,
    ContainerComponent,
    CanvasComponent,
    ToolboxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
