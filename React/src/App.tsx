import React, { useCallback, useState, useMemo } from 'react';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';

import FileManager, { Permissions } from 'devextreme-react/file-manager';

import { getAzureFileSystemProvider } from './api/azure.custom.provider';

const allowedFileExtensions: string[] = [];

export default function App(): JSX.Element {
  const [requests, setRequests] = useState<
  { method: string; urlPath: string; queryString: string }[]
  >([]);
  const onRequestExecuted = useCallback(
    ({
      method,
      urlPath,
      queryString,
    }: {
      method: string;
      urlPath: string;
      queryString: string;
    }): void => {
      const request = { method, urlPath, queryString };
      setRequests((requests) => [request, ...requests]);
    },
    [],
  );
  const fileSystemProvider = useMemo(() => getAzureFileSystemProvider(
    'https://localhost:7049/api/file-manager-azure-access',
    onRequestExecuted,
  ), []);

  return (
    <div className="main">
      <FileManager
        id="file-manager"
        fileSystemProvider={fileSystemProvider}
        allowedFileExtensions={allowedFileExtensions}
      >
        <Permissions download={true}></Permissions>
        {/* uncomment the code below to enable file/directory management */}
        {/* <Permissions
              create={true}
              copy={true}
              move={true}
              delete={true}
              rename={true}
              upload={true}
              download={true}>
            </Permissions> */}
      </FileManager>
      <div id="request-panel">
        {requests.map((r, i) => (
          <div key={i} className="request-info">
            <div className="parameter-info">
              <div className="parameter-name">Method:</div>
              <div className="parameter-value dx-theme-accent-as-text-color">
                {r.method}
              </div>
            </div>
            <div className="parameter-info">
              <div className="parameter-name">Url path:</div>
              <div className="parameter-value dx-theme-accent-as-text-color">
                {r.urlPath}
              </div>
            </div>
            <div className="parameter-info">
              <div className="parameter-name">Query string:</div>
              <div className="parameter-value dx-theme-accent-as-text-color">
                {r.queryString}
              </div>
            </div>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
}
