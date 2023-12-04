import CustomFileSystemProvider from 'devextreme/file_management/custom_provider';
import FileSystemItem from 'devextreme/file_management/file_system_item';
import UploadInfo from 'devextreme/file_management/upload_info';
import { Injectable } from '@angular/core';
import { AzureGateway } from './azure.gateway';
import { AzureFileSystem } from './azure.filesystem';

export class FileManagerService {
  fileSystemProvider: CustomFileSystemProvider;

  azure: AzureFileSystem;

  gateway: AzureGateway;

  constructor(endpointUrl: string, onRequestExecuted?: Function) {
    this.gateway = new AzureGateway(endpointUrl, onRequestExecuted);
    this.azure = new AzureFileSystem(this.gateway);

    const options = {
      getItems: this.getItems,
      createDirectory: this.createDirectory,
      renameItem: this.renameItem,
      deleteItem: this.deleteItem,
      copyItem: this.copyItem,
      moveItem: this.moveItem,
      uploadFileChunk: this.uploadFileChunk,
      downloadItems: this.downloadItems,
    };
    this.fileSystemProvider = new CustomFileSystemProvider(options);
  }

  getItems = (parentDirectory: FileSystemItem): Promise<FileSystemItem[]> => this.azure.getItems(parentDirectory.path);

  createDirectory = (parentDirectory: FileSystemItem, name: string): Promise<any> => this.azure.createDirectory(parentDirectory.path, name);

  renameItem = (item: FileSystemItem, name: string): Promise<any> => (item.isDirectory ? this.azure.renameDirectory(item.path, name) : this.azure.renameFile(item.path, name));

  deleteItem = (item: FileSystemItem): Promise<any> => (item.isDirectory ? this.azure.deleteDirectory(item.path) : this.azure.deleteFile(item.path));

  copyItem = (item: FileSystemItem, destinationDirectory: FileSystemItem): Promise<any> => {
    const destinationPath = destinationDirectory.path ? `${destinationDirectory.path}/${item.name}` : item.name;
    return item.isDirectory ? this.azure.copyDirectory(item.path, destinationPath) : this.azure.copyFile(item.path, destinationPath);
  };

  moveItem = (item: FileSystemItem, destinationDirectory: FileSystemItem): Promise<any> => {
    const destinationPath = destinationDirectory.path ? `${destinationDirectory.path}/${item.name}` : item.name;
    return item.isDirectory ? this.azure.moveDirectory(item.path, destinationPath) : this.azure.moveFile(item.path, destinationPath);
  };

  uploadFileChunk = (fileData: File, uploadInfo: UploadInfo, destinationDirectory: FileSystemItem): Promise<any> => {
    let promise = null;

    if (uploadInfo.chunkIndex === 0) {
      const filePath = destinationDirectory.path ? `${destinationDirectory.path}/${fileData.name}` : fileData.name;
      promise = this.gateway.getUploadAccessUrl(filePath).then((accessUrls) => {
        uploadInfo.customData.accessUrl = accessUrls.url1;
      });
    } else {
      promise = Promise.resolve();
    }

    promise = promise.then(() => this.gateway.putBlock(uploadInfo.customData.accessUrl, uploadInfo.chunkIndex, uploadInfo.chunkBlob));

    if (uploadInfo.chunkIndex === uploadInfo.chunkCount - 1) {
      promise = promise.then(() => this.gateway.putBlockList(uploadInfo.customData.accessUrl, uploadInfo.chunkCount));
    }

    return promise;
  };

  downloadItems = (items: FileSystemItem[]): void => {
    this.azure.downloadFile(items[0].path);
  };
}

@Injectable()
export class Service {
  getAzureFileSystemProvider(endpointUrl: string, onRequestExecuted?: Function): CustomFileSystemProvider {
    return new FileManagerService(endpointUrl, onRequestExecuted).fileSystemProvider;
  }
}
