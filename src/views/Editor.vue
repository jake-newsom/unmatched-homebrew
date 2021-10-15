<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
            <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>

      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button default-href="/"></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
      </ion-header>
    
        
      <ion-list lines="full" class="ion-no-margin">
        <ion-list-header lines="full">
          <ion-label>
            Main Hero
          </ion-label>
        </ion-list-header>
        <ion-item>
            <ion-label position="stacked">Name</ion-label>
            <ion-input v-model='character.name'></ion-input>
        </ion-item>
        <ion-item>
            <ion-label position="stacked">Health</ion-label>
            <ion-input v-model='character.health' type='number'></ion-input>
        </ion-item>
      </ion-list>

      <ion-list lines="full" class="ion-no-margin">
        <ion-list-header lines="full">
          <ion-label>
            Sidekicks
          </ion-label>
        </ion-list-header>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonToolbar, IonBackButton, IonButtons, IonList, IonItem, IonListHeader,
        IonInput, IonLabel } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StorageService from "@/services/storage.service";

export default defineComponent({
  name: 'Edit Character',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonList,
    IonListHeader,
    IonItem,
    IonInput,
    IonLabel
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const storage = StorageService;
    storage.init();
    const character = ref<Record<string,any>>({});

    const id = ref("");
    id.value = route.params.id as string;

    return { router, character, storage, id};
  },

  async mounted(){
      /** load character from storage */
      this.character = await this.storage.get("character-" + this.id);
      console.log(this.character);
  },

});
</script>

<style scoped>
#character-container{
    background-size: cover;
    background-position: center;
    box-shadow: inset 100px 0 100px #000;
}
</style>