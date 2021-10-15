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
          <div id="character-container" class='ion-padding'> 
            <h1 class='flip-in-hor-bottom'>{{character.name}}</h1>
            <healthbar :maxHealth="character.health || 1" v-on:heal="showHealAnimation" v-on:damage="showDamageAnimation"></healthbar>
          </div>
          <div id='ally-container' class='ion-padding' v-for='character,index in character.extraCharacters' v-bind:key='index'>
            <h3 class='flip-in-hor-bottom'>{{character.name}}</h3>
            <healthbar :maxHealth="character.health || 1" v-on:heal="showHealAnimation" v-on:damage="showDamageAnimation"></healthbar>
          </div>

          <div v-if="character.sidekick.quantity > 0" class='sidekick-container ion-padding'>
            <h3 class='fip-in-hor-bottom'>{{character.sidekick.name}}</h3>
            <healthbar v-if="character.sidekick.quantity == 1" :maxHealth="character.sidekick.health" v-on:heal="showHealAnimation" v-on:damage="showDamageAnimation"></healthbar>
            <ion-grid v-else class='sidekick-toggle-wrapper'>
              <ion-row>
                <ion-col v-for="(n,index) in character.sidekick.quantity" :key="index">
                  <div class='sidekick-toggle' :ref="'sidekickToggle' + index" @click="toggleSidekick(index)"> 
                    <svg class="sidekick-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 28 28">
                      <path :fill='sidekicks[index] == true? character.color : "#ccc"'
                        fill-rule="evenodd" d="M18 20l1-2 2-2V9l-4-4h-6L7 9v7l2 2 1 3 1 1 6-1 1-1zm-8-10l-1 1v3l1 1h2l1-1v-2-1l-1-1h-2zm5 1l1-1h2l1 1v3l-1 1h-2l-1-1v-2-1zm-1 4l-1 4 2-1-1-3c0-1 0-1 0 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </div>

          
          <ion-button @click='startGame' expand="block" fill="outline" >Start a Game</ion-button>

        </div>
      </div>

      <div ref="healingAnimation" class='squares'>
        <div class='square'></div>
        <div class='square'></div>
        <div class='square'></div>
        <div class='square'></div>
        <div class='square'></div>
        <div class='square'></div>
        <div class='square'></div>
        <div class='square'></div>
        <div class='square'></div>
        <div class='square'></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonToolbar, IonBackButton, IonButtons, IonButton,
        IonGrid, IonCol, IonRow } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Healthbar from "@/components/Healthbar.vue";
import StorageService from "@/services/storage.service";

export default defineComponent({
  name: 'Character',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    Healthbar,
    IonBackButton,
    IonButtons,
    IonButton,
    IonGrid,
    IonCol,
    IonRow
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
      }
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

      if(this.character.sidekick.quantity > 0){
        for(let i = 0; i < this.character.sidekick.quantity; i++){
          this.sidekicks.push(true);
        }
      }
  },

  methods:{
    showHealAnimation(){
      (this.$refs.healingAnimation as HTMLElement).style.visibility = "visible";
      setTimeout(()=>{ (this.$refs.healingAnimation as HTMLElement).style.visibility = "hidden"; }, 1000);
    },

    showDamageAnimation(){
      console.log("damage");
      (this.$refs.damageAnimation as HTMLElement).style.display = "block";
      setTimeout(() => { (this.$refs.damageAnimation as HTMLElement).style.display = "none"}, 500);
    },

    toggleSidekick(index: number){
      this.sidekicks[index] = !this.sidekicks[index];

      (this.$refs["sidekickToggle" + index] as HTMLElement).classList.add("flip-in-hor-bottom");
      setTimeout(() => { (this.$refs["sidekickToggle" + index] as HTMLElement).classList.remove("flip-in-hor-bottom"); }, 500);
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





.squares {
  height: 100%;
  display: -webkit-box;
  display: flex;
  justify-content: space-around;
  overflow: hidden;
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100%;
    visibility: hidden;
    z-index:-1;
}

.square {
  -webkit-animation: squares 1.5s linear infinite;
          animation: squares 1.5s linear infinite;
  align-self: flex-end;
  width: 0.75em;
  height: 2em;
  -webkit-transform: translateY(100%);
          transform: translateY(100%);
  background: #51f542;
}
.square::after{
  content:"";
  position:absolute;
  height:0.75em;
  width:2em;
  background:#51f542;
  top:0.625em;
  left:-.625em;
}
.square:nth-child(2) {
  -webkit-animation-delay: 1s;
          animation-delay: 1s;
  -webkit-animation-duration: 3s;
          animation-duration: 3s;
  -webkit-filter: blur(5px);
}
.square:nth-child(3) {
  -webkit-animation-delay: 1.5s;
          animation-delay: 1.5s;
  -webkit-animation-duration: 2s;
          animation-duration: 2s;
  -webkit-filter: blur();
}
.square:nth-child(4) {
  -webkit-animation-delay: 0.5s;
          animation-delay: 0.5s;
  -webkit-filter: blur(3px);
  -webkit-animation-duration: 2.4s;
          animation-duration: 2.4s;
}
.square:nth-child(5) {
  -webkit-animation-delay: 4s;
          animation-delay: 4s;
  -webkit-filter: blur(2px);
  -webkit-animation-duration: 3.2s;
          animation-duration: 3.2s;
}
.square:nth-child(6) {
  -webkit-animation-delay: 2s;
          animation-delay: 2s;
  -webkit-filter: blur(1px);
  -webkit-animation-duration: 1.7s;
          animation-duration: 1.7s;
}
.square:nth-child(7) {
  -webkit-filter: blur(2.5px);
  -webkit-animation-duration: 3.2ss;
          animation-duration: 3.2s;
}
.square:nth-child(8) {
  -webkit-animation-delay: 5s;
          animation-delay: 5s;
  -webkit-filter: blur(6px);
  -webkit-animation-duration: 4s;
          animation-duration: 4s;
}
.square:nth-child(9) {
  -webkit-filter: blur(0.5px);
  -webkit-animation-duration: 2.2s;
          animation-duration: 2.2s;
}
.square:nth-child(9) {
  -webkit-animation-delay: 6s;
          animation-delay: 6s;
  -webkit-filter: blur(0.5px);
  -webkit-animation-duration: 3.8s;
          animation-duration: 3.8s;
}

@-webkit-keyframes squares {
  from {
    -webkit-transform: translateY(100%);
            transform: translateY(100%);
    opacity:1;
  }
  to {
    -webkit-transform: translateY(calc(-100vh + -100%))  ;
            transform: translateY(calc(-100vh + -100%)) ;
            transform: translateY(100%) ;
  }
  to {
    -webkit-transform: translateY(calc(-100vh + -100%)) ;
            transform: translateY(calc(-100vh + -100%)) ;
    opacity:0;
  }
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