import type FileSystemItem from 'devextreme/file_management/file_system_item';
import type { AccessUrls, FileEntry, AzureResponse } from './types';
import type { AzureGateway } from './azure.gateway';

export class AzureFileSystem {
  gateway: AzureGateway;

  EMPTY_DIR_DUMMY_BLOB_NAME: string;

  constructor(azureGateway: AzureGateway) {
    this.gateway = azureGateway;
    this.EMPTY_DIR_DUMMY_BLOB_NAME = 'aspxAzureEmptyFolderBlob';
  }

  getItems(path: string): Promise<FileSystemItem[]> {
    var prefix = this.getDirectoryBlobName(path);

    return this.gateway
      .getBlobList(prefix)
      .then((entries) => this.getDataObjectsFromEntries(entries, prefix));
  }

  createDirectory(path: string, name: string): Promise<AzureResponse> {
    var blobName = path ? `${path}/${name}` : name;
    return this.gateway.createDirectoryBlob(blobName);
  }

  renameFile(path: string, name: string): Promise<AzureResponse> {
    var newPath = this.getPathWithNewName(path, name);
    return this.moveFile(path, newPath);
  }

  renameDirectory(path: string, name: string): Promise<AzureResponse[]> {
    var newPath = this.getPathWithNewName(path, name);
    return this.moveDirectory(path, newPath);
  }

  getPathWithNewName(path: string, name: string): string {
    var parts = path.split('/');
    parts[parts.length - 1] = name;
    return parts.join('/');
  }

  deleteFile(path: string): Promise<AzureResponse> {
    return this.gateway.deleteBlob(path);
  }

  deleteDirectory(path: string): Promise<AzureResponse[]> {
    var prefix = this.getDirectoryBlobName(path);
    return this.executeActionForEachEntry(prefix, (entry: FileSystemItem) =>
      this.gateway.deleteBlob(entry.name)
    );
  }

  copyFile(
    sourcePath: string,
    destinationPath: string
  ): Promise<AzureResponse> {
    return this.gateway.copyBlob(sourcePath, destinationPath);
  }

  copyDirectory(
    sourcePath: string,
    destinationPath: string
  ): Promise<AzureResponse[]> {
    var prefix = this.getDirectoryBlobName(sourcePath);
    var destinationKey = this.getDirectoryBlobName(destinationPath);
    return this.executeActionForEachEntry(prefix, (entry: FileSystemItem) =>
      this.copyEntry(entry, prefix, destinationKey)
    );
  }

  copyEntry(
    entry: FileSystemItem,
    sourceKey: string,
    destinationKey: string
  ): Promise<AzureResponse> {
    var restName = entry.name.substring(sourceKey.length);
    var newDestinationKey = destinationKey + restName;
    return this.gateway.copyBlob(entry.name, newDestinationKey);
  }

  moveFile(
    sourcePath: string,
    destinationPath: string
  ): Promise<AzureResponse> {
    return this.gateway
      .copyBlob(sourcePath, destinationPath)
      .then(() => this.gateway.deleteBlob(sourcePath));
  }

  moveDirectory(
    sourcePath: string,
    destinationPath: string
  ): Promise<AzureResponse[]> {
    var prefix = this.getDirectoryBlobName(sourcePath);
    var destinationKey = this.getDirectoryBlobName(destinationPath);
    return this.executeActionForEachEntry(prefix, (entry: FileSystemItem) =>
      this.copyEntry(entry, prefix, destinationKey).then(() =>
        this.gateway.deleteBlob(entry.name)
      )
    );
  }

  downloadFile(path: string): void {
    this.gateway.getBlobUrl(path).then(
      (accessUrls: AccessUrls) => {
        window.location.href = accessUrls.url1 ?? '';
      },
      (e) => new Error(e)
    );
  }

  executeActionForEachEntry(
    prefix: string,
    action: Function
  ): Promise<AzureResponse[]> {
    return this.gateway.getBlobList(prefix).then((entries) => {
      var deferreds = entries.map(
        (entry) => action(entry) as Promise<AzureResponse>
      );
      return Promise.all(deferreds);
    });
  }

  getDataObjectsFromEntries(
    entries: FileEntry[],
    prefix: string
  ): FileSystemItem[] {
    const result: FileSystemItem[] = [];
    const directories: Record<string, FileSystemItem> = {};

    entries.forEach((entry) => {
      let restName = entry.name?.substring(prefix.length) ?? '';
      const parts = restName?.split('/') || '';

      if (parts.length === 1) {
        if (restName !== this.EMPTY_DIR_DUMMY_BLOB_NAME) {
          const obj: FileSystemItem = {
            name: restName,
            isDirectory: false,
            dateModified: entry.lastModified ?? new Date(),
            size: entry.length,
            path: '',
            pathKeys: [],
            key: '',
            hasSubDirectories: false,
            thumbnail: '',
            dataItem: undefined,
            getFileExtension(): string {
              throw new Error('Function not implemented.');
            },
          };
          result.push(obj);
        }
      } else {
        let dirName = parts[0];
        let directory = directories[dirName];
        if (!directory) {
          directory = {
            name: dirName,
            isDirectory: true,
            path: '',
            pathKeys: [],
            key: '',
            hasSubDirectories: false,
            dateModified: new Date(),
            size: 0,
            thumbnail: '',
            dataItem: undefined,
            getFileExtension(): string {
              throw new Error('Function not implemented.');
            },
          };
          directories[dirName] = directory;
          result.push(directory);
        }

        if (!directory.hasSubDirectories) {
          directory.hasSubDirectories = parts.length > 2;
        }
      }
    });

    result.sort(this.compareDataObjects);

    return result;
  }

  compareDataObjects(obj1: FileSystemItem, obj2: FileSystemItem): number {
    if (obj1.isDirectory === obj2.isDirectory) {
      var name1 = obj1.name.toLowerCase();
      var name2 = obj2.name.toLowerCase();
      if (name1 < name2) {
        return -1;
      }
      return name1 > name2 ? 1 : 0;
    }

    return obj1.isDirectory ? -1 : 1;
  }

  getDirectoryBlobName(path: string): string {
    return path ? `${path}/` : path;
  }
}
