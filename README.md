# FileManager for DevExtreme - Azure Client-Side Binding

This example illustrates how to use the custom file provider to connect the FileManager component to the Azure Blob Storage on the client side. The [Custom File System Provider](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxFileManager/File_System_Providers/Custom) allows you to implement custom APIs to handle file operations (add, delete, rename, etc.). All APIs that implement access to Azure Blob Storage on the client are stored in the azure.file.system.js file (app.service.ts - for Angular framework). On the server, configure the [Shared Access Signature (SAS)](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview) to grant access to blobs in the storage.

![FileManager](/file-manager-client-side-binding.png)

## Files to Review

- **jQuery**
    - [index.js](jQuery/src/index.js)
- **Angular**
    - [app.component.html](Angular/src/app/app.component.html)
    - [app.component.ts](Angular/src/app/app.component.ts)
- **Vue**
    - [Home.vue](Vue/src/components/HomeContent.vue)
- **React**
    - [App.tsx](React/src/App.tsx)
- **NetCore**    
    - [Index.cshtml](ASP.NET%20Core/Views/Home/Index.cshtml)

## Documentation

- [Getting Started with FileManager](https://js.devexpress.com/Angular/Documentation/Guide/UI_Components/FileManager/Getting_Started_with_File_Manager/)
- [Bind FileManager to File Systems](https://js.devexpress.com/Angular/Documentation/Guide/UI_Components/FileManager/Bind_to_File_Systems/)

## More Examples

- [FileManager for DevExtreme - Azure Server-Side Binding](https://github.com/DevExpress-Examples/devextreme-file-manager-azure-server-side-binding)
- [FileUploader for DevExtreme - Direct Upload to Azure](https://github.com/DevExpress-Examples/devextreme-file-uploader-direct-upload-to-azure)