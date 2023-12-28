<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';

import {
  DxFileManager, DxPermissions
} from 'devextreme-vue/file-manager';

import 'devextreme/dist/css/dx.material.blue.light.compact.css';

import { getAzureFileSystemProvider } from '../api/azure.custom.provider';

const requests: Ref<{ method: string; urlPath: string; queryString: string }[]> = ref([]);

const onRequestExecuted = (
  { method, urlPath, queryString }: { method: string; urlPath: string; queryString: string }
) => {
  const request = { method, urlPath, queryString };
  requests.value = [request, ...requests.value];
};
const endpointUrl = 'https://localhost:7049/api/file-manager-azure-access';
const allowedFileExtensions: string [] = [];

const fileSystemProvider = getAzureFileSystemProvider(endpointUrl, onRequestExecuted);
</script>
<template>
  <div class="default-style">
    <DxFileManager
      :file-system-provider="fileSystemProvider"
      :allowed-file-extensions="allowedFileExtensions"
    >
      <DxPermissions/>
    <!-- uncomment the code below to enable file/directory management -->
    <!-- <DxPermissions
      :create="true"
      :copy="true"
      :move="true"
      :delete="true"
      :rename="true"
      :upload="true"
      :download="true"
    /> -->
    </DxFileManager>
    <div id="request-panel">
      <div
        class="request-info"
        v-for="(request, index) in requests"
        :key="index"
      >
        <div class="parameter-info">
          <div class="parameter-name">Method:</div>
          <div class="parameter-value dx-theme-accent-as-text-color">
            {{ request.method }}
          </div>
        </div>
        <div class="parameter-info">
          <div class="parameter-name">Url path:</div>
          <div class="parameter-value dx-theme-accent-as-text-color">
            {{ request.urlPath }}
          </div>
        </div>
        <div class="parameter-info">
          <div class="parameter-name">Query string:</div>
          <div class="parameter-value dx-theme-accent-as-text-color">
            {{ request.queryString }}
          </div>
        </div>
        <br>
      </div>
    </div>
  </div>
</template>

<style>
.default-style {
  margin: 50px;
  width: 90vw;
}

#message-box {
  margin-bottom: 10px;
  font-size: 16px;
}

#request-panel {
  min-width: 505px;
  height: 400px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 18px;
  margin-top: 40px;
  background-color: rgb(191 191 191 / 15%);
}

#request-panel .parameter-info {
  display: flex;
}

.request-info .parameter-name {
  flex: 0 0 100px;
}

.request-info .parameter-name,
.request-info .parameter-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
