<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { Capacitor } from '@capacitor/core';


export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  }, 

  mounted(){
    if(Capacitor.isNativePlatform()){
      ScreenOrientation.lock(ScreenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);
    }
  }
});
</script>