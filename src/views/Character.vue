<template>
  <ion-page>
    <ion-header :translucent="true" class="ion-no-border">
      <ion-toolbar class="ion-no-border">
        <ion-buttons slot="start">
            <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>

      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" >
      <ion-header collapse="condense" :translucent="true" class="ion-no-border">
        <ion-toolbar class="ion-no-border">
            <ion-buttons slot="start">
                <ion-back-button default-href="/"></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <div class='page-wrapper ion-text-center'>
        <div id='damage-animation' ref="damageAnimation" class='fade-out'></div>

        <div class='deco slide-in-bck-center' :style="{background: character.color}"></div>
        
        <div class='card slit-in-vertical' :style="{ backgroundImage: 'url(' + character.cardback + ')' }"></div>
        <div id="healthbar-container" class="ion-padding">
          <ion-grid>
            <ion-row id="character-container">
                <ion-col>
                    <h3>{{character.name}}</h3>
                    <graphic-healthbar 
                        :maxHealth="character.health || 1" 
                        :color="character.color"
                        @heal="showHealAnimation" 
                        @damage="showDamageAnimation"></graphic-healthbar>
                </ion-col>
            </ion-row>
            <ion-row id='ally-container' v-for='char,index in character.extraCharacters' v-bind:key='index'>
                <ion-col>
                    <h3>{{char.name}}</h3>
                    <graphic-healthbar 
                        :maxHealth="char.health || 1" 
                        :color="character.color"
                        @heal="showHealAnimation" 
                        @damage="showDamageAnimation"></graphic-healthbar>
                </ion-col>
            </ion-row>
            <ion-row v-if="character.sidekick.quantity > 0" class='sidekick-container'>
                <ion-col>
                    <h3>{{character.sidekick.name}}</h3>
                    <graphic-healthbar 
                        v-if="character.sidekick.quantity == 1"
                        :maxHealth="character.sidekick.health || 1" 
                        :color="character.color"
                        @heal="showHealAnimation" 
                        @damage="showDamageAnimation"></graphic-healthbar>
                    <sidekick-toggles v-else :count="character.sidekick.quantity" :color="character.color"></sidekick-toggles>
                </ion-col>
            </ion-row>
          </ion-grid>

          
          <ion-button @click='startGame' expand="block" fill="outline" >Start a Game</ion-button>

        </div>
      </div>

      <heal-animation ref="healAnimation"></heal-animation>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonToolbar, IonBackButton, IonButtons, IonButton,
        IonGrid, IonCol, IonRow } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import GraphicHealthbar from "@/components/GraphicHealthbar.vue";
import StorageService from "@/services/storage.service";

import HealAnimation from "@/components/effects/Heal.vue";
import SidekickToggles from "@/components/ui/SidekickToggles.vue"

export default defineComponent({
  name: 'Character',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    GraphicHealthbar,
    IonBackButton,
    IonButtons,
    IonButton,
    IonGrid,
    IonCol,
    IonRow,
    HealAnimation,
    SidekickToggles
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const storage = StorageService;
    storage.init();
    const character = ref<Record<string,any>>({
      name: "",
      health: 0,
      extraCharacters:[],
      sidekick: {
        quantity: 0,
        health: 0,
        name: ""
      },
      color:"#FFFFFF"
    });

    const sidekicks = ref<boolean[]>([]);

    const id = ref("");
    id.value = route.params.id as string;

    return { router, character, storage, id, sidekicks};
  },

  async mounted(){
      /** load character from storage */
      console.log(this.id);
      this.character = await this.storage.get("character-" + this.id);
      console.log(this.character);
  },

  methods:{
    showHealAnimation(){
      (this.$refs.healAnimation as any).play();
    },

    showDamageAnimation(){
      console.log("damage");
      (this.$refs.damageAnimation as HTMLElement).style.display = "block";
      setTimeout(() => { (this.$refs.damageAnimation as HTMLElement).style.display = "none"}, 500);
    },

    startGame(){
      this.router.push({ path: "/game/" + this.character.id });
    }
  }

});
</script>

<style scoped>

ion-button.button-block {
    --border-radius: 20px;
}

ion-toolbar {
  --background:transparent;
  --ion-color-base: transparent!important;
  box-shadow:none!important;
}

#character-container, #ally-container, .sidekick-container{
    padding-top:0;
    padding-bottom:0;
}

ion-page{
  background-size:cover;
  background-position:center;
}

#healthbar-container {
  padding-top:0;
}

.deco{
  height: 53%;
  position: absolute;
  top: -10%;
  width: 160%;
  left: -30%;
  border-radius: 50%;
  z-index:-1;
  margin-top: -25%;
  box-shadow: inset 0 -5px 20px rgb(0 0 0 / 30%);
}


.card{
    width: 6rem;
    height: 10rem;
    background-size: cover;
    background-position: center;
    border-radius: 4px;
    border: 3px solid #fff;
    margin: 0 auto;
    
    box-shadow:
      0 1px 1px hsl(0deg 0% 0% / 0.075),
      0 2px 2px hsl(0deg 0% 0% / 0.075),
      0 4px 4px hsl(0deg 0% 0% / 0.075),
      0 8px 8px hsl(0deg 0% 0% / 0.075),
      0 16px 16px hsl(0deg 0% 0% / 0.075)
}







.slit-in-vertical {
	-webkit-animation: slit-in-vertical 0.45s ease-out both;
	animation: slit-in-vertical 0.45s ease-out both;
}
/* ----------------------------------------------
 * Generated by Animista on 2021-10-9 14:50:39
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation slit-in-vertical
 * ----------------------------------------
 */
@-webkit-keyframes slit-in-vertical {
  0% {
    -webkit-transform: translateZ(-800px) rotateY(90deg);
            transform: translateZ(-800px) rotateY(90deg);
    opacity: 0;
  }
  54% {
    -webkit-transform: translateZ(-160px) rotateY(87deg);
            transform: translateZ(-160px) rotateY(87deg);
    opacity: 1;
  }
  100% {
    -webkit-transform: translateZ(0) rotateY(0);
            transform: translateZ(0) rotateY(0);
  }
}
@keyframes slit-in-vertical {
  0% {
    -webkit-transform: translateZ(-800px) rotateY(90deg);
            transform: translateZ(-800px) rotateY(90deg);
    opacity: 0;
  }
  54% {
    -webkit-transform: translateZ(-160px) rotateY(87deg);
            transform: translateZ(-160px) rotateY(87deg);
    opacity: 1;
  }
  100% {
    -webkit-transform: translateZ(0) rotateY(0);
            transform: translateZ(0) rotateY(0);
  }
}

/* ----------------------------------------------
 * Generated by Animista on 2021-10-9 14:51:52
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */


.slide-in-bck-center {
	-webkit-animation: slide-in-bck-center 1.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  animation: slide-in-bck-center 1.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}
/**
 * ----------------------------------------
 * animation slide-in-bck-center
 * ----------------------------------------
 */
@-webkit-keyframes slide-in-bck-center {
  0% {
    -webkit-transform: translateZ(600px);
            transform: translateZ(600px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateZ(0);
            transform: translateZ(0);
    opacity: 1;
  }
}
@keyframes slide-in-bck-center {
  0% {
    -webkit-transform: translateZ(600px);
            transform: translateZ(600px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateZ(0);
            transform: translateZ(0);
    opacity: 1;
  }
}





/* ----------------------------------------------
 * Generated by Animista on 2021-10-9 20:20:5
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation flip-in-hor-bottom
 * ----------------------------------------
 */
@-webkit-keyframes flip-in-hor-bottom {
  0% {
    -webkit-transform: rotateX(80deg);
            transform: rotateX(80deg);
    opacity: 0;
  }
  100% {
    -webkit-transform: rotateX(0);
            transform: rotateX(0);
    opacity: 1;
  }
}
@keyframes flip-in-hor-bottom {
  0% {
    -webkit-transform: rotateX(80deg);
            transform: rotateX(80deg);
    opacity: 0;
  }
  100% {
    -webkit-transform: rotateX(0);
            transform: rotateX(0);
    opacity: 1;
  }
}
.flip-in-hor-bottom {
	-webkit-animation: flip-in-hor-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
	animation: flip-in-hor-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  animation-delay: 0.2s;
  --webkit-animation-delay: 0.2s;
}


div#damage-animation {
    display:none;
    position: absolute;
    top: 0;
    background: #ff0000;
    z-index: 10;
    width: 100%;
    height: 100%;
}
/* ----------------------------------------------
 * Generated by Animista on 2021-10-11 17:32:48
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

@-webkit-keyframes fade-out{0%{opacity:1}100%{opacity:0}}@keyframes fade-out{0%{opacity:1}100%{opacity:0}}
.fade-out{-webkit-animation:fade-out .2s ease-out both;animation:fade-out .2s ease-out both}



</style>