import { Component } from '@angular/core';

import CustomFileSystemProvider from 'devextreme/file_management/custom_provider';
import { Service } from './services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [Service],
})
export class AppComponent {
  allowedFileExtensions: string[];

  fileSystemProvider!: CustomFileSystemProvider;

  requests: any[];

  constructor(service: Service) {
    const endpointUrl = 'https://localhost:7049/api/file-manager-azure-access';
    this.allowedFileExtensions = [];

    this.requests = [];
    this.fileSystemProvider = service.getAzureFileSystemProvider(endpointUrl, this.onRequestExecuted);
  }

  onRequestExecuted = ({ method, urlPath, queryString }: { method: string; urlPath: string; queryString: string }): void => {
    const request = { method, urlPath, queryString };
    this.requests.unshift(request);
  };
}
