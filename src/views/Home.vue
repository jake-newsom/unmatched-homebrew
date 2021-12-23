<template>
  <ion-page>    
    <ion-header :translucent="true" class="ion-no-border">
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class='ion-padding'>
        <h1 id='header'>My Decks</h1>
      </div>
      <div id="container">   
         
        <ion-list v-if="characters.length > 0">
          <ion-item-sliding v-for="character,index in characters" 
            :style="{
              '--animation-order':index, 
              backgroundColor: shadeColor(character.appearance.highlightColour,40) 
            }" 
            v-bind:key="character.id">

            <ion-item class='characterItem ion-padding'>
              <div class='character-item-wrapper ion-padding' >
                <span class='character-name'>{{character.hero.name}}</span><br/>
                <ion-icon :icon="playOutline" @click='openCharacter(character.id)' size="large" ></ion-icon>
                <ion-icon :icon="informationCircleOutline" @click="previewCards(character)" size="large" ></ion-icon>
              </div>
              <div class="deco" :style="{ backgroundColor: character.appearance.highlightColour }"></div>
              <div class='card flip-in-ver-left' :style="{ '--animation-order':index, backgroundImage: 'url(' + character.appearance.cardbackUrl + ')' }"></div>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="danger" expandable @click="deleteCharacter(character.id)">
                <ion-icon size="large" :icon="trashOutline"></ion-icon>
              </ion-item-option>
            </ion-item-options>
            

          </ion-item-sliding>
        </ion-list>
      </div>


      
    <ion-fab vertical="bottom" horizontal="end" slot="fixed" color="primary">
      <ion-fab-button router-link="/search" color="primary">
        <ion-icon :icon="addOutline"></ion-icon>
      </ion-fab-button>
    </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage,IonList, IonItemSliding, IonItem, 
    IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton, alertController, loadingController, modalController} from '@ionic/vue';
import { addOutline,trashOutline, createOutline, informationCircleOutline, playOutline } from 'ionicons/icons';
import { defineComponent, ref } from 'vue';


import StorageService from "@/services/storage.service";
import CardApiService from "@/services/cardapi.service";
import DownloadService from '@/services/download.service';

import PreviewCardsModal from "@/components/modals/PreviewCardsModal.vue"
import { Capacitor } from '@capacitor/core';
import { Deck } from '@/types/Decks';
import { useRouter } from 'vue-router';


export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonItem,
    IonList,
    IonIcon,
    IonFab,
    IonFabButton
  },

  setup() {
    const storage = StorageService;
    const router = useRouter();
    storage.init();

    CardApiService.init();

    const characters = ref<any[]>([]);

    const currentDeckVersion = ref(1);

    return { router, characters, addOutline, storage, trashOutline, createOutline, currentDeckVersion, informationCircleOutline, playOutline};
  },

  ionViewDidEnter(){
    this.loadCharacters();
  },

  methods: {

    async presentImportDialog(){
      const alert = await alertController.create({
        cssClass: "import-dialog",
        header: "Unmatched.cards URL",
        message: "Provide a url from unmatched.cards to import a character.",
        inputs: [{
          name: "url",
          id:"import-url",
          value: "",
          placeholder: "https://www.google.com"
        }],
        buttons: [{
          text: "Import",
          handler:(data) => {
            this.importCharacter(data.url);
          }
        }]
      });
      await alert.present();
    },

    async importCharacter(url: string){
      
      const loading = await loadingController.create({
          cssClass: 'deck-loader',
          message: 'Loading Deck Data...',
          duration: 30000,
        });

      await loading.present();

      const urlPieces = url.split("/");
      const id = urlPieces[urlPieces.length-1];

      const character: any = await CardApiService.getDeck(id);
      loading.dismiss();

      this.saveCharacter(character);
    },


    async deleteCharacter(character: any){
      
      let characterIds: string[] = await this.storage.get("characterIds") as string[] ;
      characterIds = characterIds.filter(function(c){ return c != character; });
      await this.storage.set("characterIds", characterIds);


      await this.storage.remove(character);
      this.characters = this.characters.filter(function(c){ return c.id != character; });

    },

    async saveCharacter(character: any){

      /** add to temp object */
      this.characters.push( character );

      /** save in storage */
      let characterIds: string[] = await this.storage.get("characterIds") as string[] ;
      if(characterIds == null){
        characterIds = [];
      }

      characterIds.push(character.id);

      await this.storage.set("characterIds", [...new Set(characterIds)]);
      await this.storage.set("character-" + character.id, character);
          
    },

    async loadCharacters(){
      let characterIds: string[] = [];
      characterIds = await this.storage.get("characterIds") as string[] ;

      if(characterIds != null && characterIds.length > 0){

        const loadedCharacters = [];
        for(const id in characterIds){
          let character = await this.storage.get("character-" + characterIds[id]) as Deck;

          if(character.version == undefined || character.version < CardApiService.version()){
            console.log("Character data outload, reload " + characterIds[id]);
            this.saveCharacter( await CardApiService.getDeck(characterIds[id]) );
            character = await this.storage.get("character-" + characterIds[id]) as Deck;
          }

          if(Capacitor.isNativePlatform()){
            DownloadService.fileExists( characterIds[id] + ".png")
              .then(exists => {
                if(!exists){
                  console.log("Download " + characterIds[id]);
                  DownloadService.startDownload( CardApiService.cardImagesBaseURL(characterIds[id]), characterIds[id] + ".png");
                }
              });
          }

          loadedCharacters.push(character);
        }
        
        this.characters = loadedCharacters;
        console.log("LOaded: ", this.characters);
      }
    }, 
    
    async previewCards(character: any){
      console.log(character);
      
      const modal = await modalController
          .create({
              component: PreviewCardsModal,
              cssClass: 'view-card-list',
              componentProps: {
                  deck: character
              },
          });
      modal.present();
    },
    

    openCharacter(id: string){
      this.router.push('/character/' + id);
    },

    shadeColor(color: string, amount: number) {
      return '#' + color.replace(/^#/, '').replace(/../g, color =>
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }
    
  }
});
</script>

<style scoped>
#header {
  font-size:3rem;
}

ion-toolbar {
  --background:transparent;
  --ion-color-base: transparent!important;
  box-shadow:none!important;
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}

ion-item.characterItem{
  background-size: cover!important;
  background-position:center!important;  
  --background: transparent!important;
  --border-color: transparent;
  box-shadow: rgb(0 0 0 / 24%) 10px 0px 20px, rgb(0 0 0 / 24%) -10px 0px 10px;
    padding: 0 !important;
    --padding-bottom: 0!important;
    --padding-end: 0;
}

.card{
  
    width: 5rem;
    height: 8rem;
    background-size: cover;
    background-position: center;
    border-radius: 4px;
    border: 3px solid #fff;
    box-shadow: 0 -5px 15px rgb(0 0 0 / 30%);    
    position: absolute;
    right: 8%;
    bottom: -3rem;
}

ion-item.characterItem .card{
    animation-delay:calc(var(--animation-order) * 130ms) ;
    --webkit-animation-delay:calc(var(--animation-order) * 130ms) ;
}

.character-item-wrapper {
    width: 100%;
    min-height:90px;
    border-radius: 5px;
    --padding-bottom:0!important;
}


.character-item-wrapper ion-icon {
    margin-top: 0.8rem;
    padding: 0 1rem;
    color:black;
}

ion-item-sliding {
    margin: 20px 5% !important;
    width: 90%;
    border-radius: 10px;
    padding: 0!important;
    box-shadow: 0 1px 1px hsl(0deg 0% 0% / 8%), 0 2px 2px hsl(0deg 0% 0% / 8%), 0 4px 4px hsl(0deg 0% 0% / 8%), 0 8px 8px hsl(0deg 0% 0% / 8%), 0 16px 16px hsl(0deg 0% 0% / 8%), inset 0 -1px 1px rgb(0 0 0 / 20%);
    animation: popIn 0.2s  calc(var(--animation-order) * 70ms) both ease-in;
}

.deco {
    border-radius: 50%;
    width: 100%;
    position: absolute;
    top: 1%;
    right: -30%;
    width: 20rem;
    height: 20rem;
    z-index:-1;
}

span.character-name {
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: bold;
    font-size: 1.2em;
    max-width: 68%;
    display: inline-block;
    color: var(--ion-dark-text-color);
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.6) translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

/* ----------------------------------------------
 * Generated by Animista on 2021-10-9 15:2:27
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation slide-in-right
 * ----------------------------------------
 */
@-webkit-keyframes slide-in-right {
  0% {
    -webkit-transform: translateX(1000px);
            transform: translateX(1000px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateX(0);
            transform: translateX(0);
    opacity: 1;
  }
}
@keyframes slide-in-right {
  0% {
    -webkit-transform: translateX(1000px);
            transform: translateX(1000px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateX(0);
            transform: translateX(0);
    opacity: 1;
  }
}


.slide-in-right {
	-webkit-animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
	animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}

/* ----------------------------------------------
 * Generated by Animista on 2021-10-9 14:58:6
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation flip-in-ver-left
 * ----------------------------------------
 */
@-webkit-keyframes flip-in-ver-left {
  0% {
    -webkit-transform: rotateY(80deg);
            transform: rotateY(80deg);
    opacity: 0;
  }
  100% {
    -webkit-transform: rotateY(0);
            transform: rotateY(0);
    opacity: 1;
  }
}
@keyframes flip-in-ver-left {
  0% {
    -webkit-transform: rotateY(80deg);
            transform: rotateY(80deg);
    opacity: 0;
  }
  100% {
    -webkit-transform: rotateY(0);
            transform: rotateY(0);
    opacity: 1;
  }
}
.flip-in-ver-left {
	-webkit-animation: flip-in-ver-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
	animation: flip-in-ver-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}
</style>