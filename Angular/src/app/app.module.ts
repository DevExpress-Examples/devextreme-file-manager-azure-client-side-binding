import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxFileManagerModule } from 'devextreme-angular/ui/file-manager';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DxFileManagerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
