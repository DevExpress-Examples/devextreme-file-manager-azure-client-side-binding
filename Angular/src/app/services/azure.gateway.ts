export class AzureGateway {
  endpointUrl: any;

  onRequestExecuted: any;

  constructor(endpointUrl: string, onRequestExecuted?: Function) {
    this.endpointUrl = endpointUrl;
    this.onRequestExecuted = onRequestExecuted;
  }

  getBlobList(prefix: string): Promise<FileEntry[]> {
    return this.getAccessUrl('BlobList')
      .then((accessUrls: AccessUrls) => this.executeBlobListRequest(accessUrls.url1, prefix))
      .then((xml) => this.parseEntryListResult(xml));
  }

  parseEntryListResult(xmlString: string): FileEntry[] {
    var xml = new DOMParser().parseFromString(xmlString, 'text/xml');
    return Array.from(xml.querySelectorAll('Blob')).map(this.parseEntry);
  }

  parseEntry(xmlEntry: any): FileEntry {
    var entry: FileEntry = {
      etag: '',
      name: '',
      lastModified: undefined,
      length: 0,
    };

    entry.etag = xmlEntry.querySelector('Etag').textContent;
    entry.name = xmlEntry.querySelector('Name').textContent;

    var dateStr = xmlEntry.querySelector('Last-Modified').textContent;
    entry.lastModified = new Date(dateStr);

    var lengthStr = xmlEntry.querySelector('Content-Length').textContent;
    entry.length = parseInt(lengthStr, 10);

    return entry;
  }

  executeBlobListRequest(accessUrl: string, prefix: string): Promise<any> {
    var params: RequestParams = {
      restype: 'container',
      comp: 'list',
    };
    if (prefix) {
      params.prefix = prefix;
    }
    return this.executeRequest(accessUrl, params);
  }

  createDirectoryBlob(name: string): Promise<any> {
    return this.getAccessUrl('CreateDirectory', name).then((accessUrls: AccessUrls) => this.executeRequest({
      url: accessUrls.url1,
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
      },
      processData: false,
      contentType: false,
    }));
  }

  deleteBlob(name: string): Promise<any> {
    return this.getAccessUrl('DeleteBlob', name).then((accessUrls: AccessUrls) => this.executeRequest({
      url: accessUrls.url1,
      method: 'DELETE',
    }));
  }

  copyBlob(sourceName: string, destinationName: string): Promise<any> {
    return this.getAccessUrl('CopyBlob', sourceName, destinationName).then((accessUrls: AccessUrls) => this.executeRequest({
      url: accessUrls.url2,
      method: 'PUT',
      headers: {
        'x-ms-copy-source': accessUrls.url1,
      },
    }));
  }

  putBlock(uploadUrl: string, blockIndex: number, blockBlob: Blob): Promise<any> {
    var blockId = this.getBlockId(blockIndex);
    var params: RequestParams = {
      comp: 'block',
      blockid: blockId,
    };
    return this.executeRequest(
      {
        url: uploadUrl,
        method: 'PUT',
        body: blockBlob,
        processData: false,
        contentType: false,
      },
      params,
    );
  }

  putBlockList(uploadUrl: string, blockCount: number): Promise<any> {
    var content = this.getBlockListContent(blockCount);
    var params: RequestParams = {
      comp: 'blocklist',
    };
    return this.executeRequest(
      {
        url: uploadUrl,
        method: 'PUT',
        body: content,
      },
      params,
    );
  }

  getBlockListContent(blockCount: number): string {
    var contentParts = ['<?xml version="1.0" encoding="utf-8"?>', '<BlockList>'];

    for (var i = 0; i < blockCount; i++) {
      var blockContent = `  <Latest>${this.getBlockId(i)}</Latest>`;
      contentParts.push(blockContent);
    }

    contentParts.push('</BlockList>');
    return contentParts.join('\n');
  }

  getBlockId(blockIndex: number): string {
    var res = `${blockIndex}`;
    while (res.length < 10) {
      res = `0${res}`;
    }
    return window.btoa(res);
  }

  getUploadAccessUrl(blobName: string): Promise<AccessUrls> {
    return this.getAccessUrl('UploadBlob', blobName);
  }

  getBlobUrl(blobName: string): Promise<AccessUrls> {
    return this.getAccessUrl('GetBlob', blobName);
  }

  getAccessUrl(command: string, blobName?: string, blobName2?: string): Promise<AccessUrls> {
    var url = `${this.endpointUrl}?command=${command}`;
    if (blobName) {
      url += `&blobName=${encodeURIComponent(blobName)}`;
    }
    if (blobName2) {
      url += `&blobName2=${encodeURIComponent(blobName2)}`;
    }

    return new Promise((resolve, reject) => {
      this.executeRequest(url).then((x: any) => {
        if (x.success) {
          resolve({ url1: x.accessUrl, url2: x.accessUrl2 });
        } else {
          reject(x.error);
        }
      }).catch((e) => new Error(e));
    });
  }

  executeRequest(args: any, commandParams?: RequestParams): Promise<Response | string | Record<string, unknown>> {
    const ajaxArgs = typeof args === 'string' ? { url: args } : args;

    const method = ajaxArgs.method || 'GET';

    const urlParts = ajaxArgs.url.split('?');
    const urlPath = urlParts[0];
    const restQueryString = urlParts[1];
    const commandQueryString = commandParams ? this.getQueryString(commandParams) : '';

    let queryString = commandQueryString || '';
    if (restQueryString) {
      queryString = queryString ? `${queryString}&${restQueryString}` : restQueryString;
    }

    ajaxArgs.url = queryString ? `${urlPath}?${queryString}` : urlPath;

    return fetch(ajaxArgs.url, ajaxArgs)
      .then((x) => {
        const eventArgs = {
          method,
          urlPath,
          queryString,
        };
        if (this.onRequestExecuted) {
          this.onRequestExecuted(eventArgs);
        }
        return x;
      })
      .then(async (x) => {
        if (x.status === 200 || x.status === 201) {
          const text = await x.text();
          try {
            return { success: true, ...JSON.parse(text) } as Record<string, unknown>;
          } catch (ex) {
            return text;
          }
        } else {
          return { error: x.statusText };
        }
      });
  }

  getQueryString(params: RequestParams): string {
    return Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key as keyof RequestParams] ?? '')}`)
      .join('&');
  }
}
export interface FileEntry {
  etag: string;
  name: string;
  lastModified: Date | undefined;
  length: number;
}
interface RequestParams {
  restype?: string;
  comp?: string;
  prefix?: string;
  blockid?: string;
}
export interface AccessUrls {
  url1: string;
  url2: string;
}
