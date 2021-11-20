<template>
  <ion-page>    
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-no-border">
        <ion-buttons slot="start">
            <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>

      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class='ion-padding' id="search-wrapper" slot="fixed">
        <h1 id='header'>Search Decks</h1>       
        <ion-item style='margin-bottom:0;'>
            <ion-label position="stacked">Search for...</ion-label>
            <ion-input @keyup="startTriggerTimer" v-model="searchQuery"></ion-input>
        </ion-item>
      </div>
      <div id="container">   
          <div id="searching-wrapper" v-if="searching">
              <div class="ball-loader">
                <div class="ball-loader-ball ball1"></div>
                <div class="ball-loader-ball ball2"></div>
                <div class="ball-loader-ball ball3"></div>
            </div>
          </div>
         
        <ion-list v-if="characters != undefined && characters.length > 0">
          <ion-item v-for="character,index in characters" 
            :key="character.id" 
            @click="importCharacter(character.version_id)" >

            <div class='characterItem ion-padding' 
                :class="{
                    downloading: downloading.includes(character.version_id),
                    downloaded: character.downloaded
                }"
                :style="{
                '--animation-order':index, 
                backgroundColor: shadeColor(character.deck_data.appearance.highlightColour,40) 
                }" >
                <div class='downloading-status'>Downloading...<br/><ion-icon :icon="reloadOutline"></ion-icon></div>
              <div class='character-item-wrapper ion-padding' >
                <span class='character-name'>{{character.name}}</span>
                <span class='author-name'>by {{character.user}}</span><br/>
                <ion-icon v-if="!character.downloaded" :icon="cloudDownloadOutline" size="large" color="black"></ion-icon>
                <span v-else class='downloaded-label'>Saved</span>
              </div>
              <div class="deco" :style="{ backgroundColor: character.deck_data.appearance.highlightColour }"></div>
              <div class='card flip-in-ver-left' :style="{ '--animation-order':index, backgroundImage: 'url(' + character.deck_data.appearance.cardbackUrl + ')' }"></div>
            </div>            

          </ion-item>
        </ion-list>
      </div>


    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonList, IonItem, IonInput, IonIcon,
    IonLabel, IonToolbar, IonBackButton, IonButtons } from '@ionic/vue';
import { addOutline,trashOutline, createOutline, cloudDownloadOutline, reloadOutline } from 'ionicons/icons';
import { defineComponent, ref } from 'vue';


import StorageService from "@/services/storage.service";
import CardApiService from "@/services/cardapi.service";

export default defineComponent({
  name: 'Search',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonItem,
    IonList,
    IonInput,
    IonLabel,
    IonIcon,
    IonToolbar,
    IonBackButton,
    IonButtons
  },

  setup() {
    const storage = StorageService;
    storage.init();

    CardApiService.init();

    const characters = ref<any[]>([]);
    const searchQuery = ref("");


    const searchTrigger = ref<any>();
    const searching = ref(false);
    const downloading = ref<string[]>([]);

    const myCharacters = ref<string[]>([]);


    const loadCharacters = async () => {
        console.log("Load characters");
        myCharacters.value = await storage.get("characterIds") as string[] || [];
        console.log(myCharacters.value);
    }

    loadCharacters();

    return { 
        cloudDownloadOutline, myCharacters, reloadOutline,
        characters, addOutline, storage, trashOutline, createOutline, searchQuery, searchTrigger, searching, downloading};
  },

  methods: {

    startTriggerTimer(){
        clearInterval(this.searchTrigger);
        this.searchTrigger = setTimeout( this.search, 1000);
    },

    search(){
        this.searching = true;
        CardApiService.searchDecks(this.searchQuery.replace(/\s/g, '+'))
            .then(result => {
                this.characters = result.map((c: any) => {
                    c.downloaded = this.myCharacters.includes(c.version_id);
                    return c;
                });
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                this.searching = false;
            })
    },

    async importCharacter(id: string){
        if(!this.myCharacters.includes(id)){
            
            this.downloading.push(id);

            const result = CardApiService.getDeck(id)
                .then(character => {
                    this.saveCharacter(character);
                })
                .catch(err => {
                    console.log(err);
                    this.downloading = this.downloading.filter(c => { return c != id; })
                })
        }
    },

    async saveCharacter(character: any){

       /** save in storage */
      let characterIds: string[] = await this.storage.get("characterIds") as string[] ;
      if(characterIds == null){
        characterIds = [];
      }

      characterIds.push(character.id);

      await this.storage.set("characterIds", [...new Set(characterIds)]);
      await this.storage.set("character-" + character.id, character);
      
      this.finishDownloading(character.id);
          
    },

    finishDownloading(id: string){
        console.log(" remove " + id + " from ", this.downloading);
        this.downloading = this.downloading.filter( c => { return c != id; });

        this.characters = this.characters.map((c: any) => { 
            if(c.version_id == id){
                c.downloaded = true;
            }
            return c;
        });
    },

    shadeColor(color: string, amount: number) {
      return '#' + color.replace(/^#/, '').replace(/../g, color =>
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    },
    
  }
});
</script>

<style scoped>
div#search-wrapper {
    width: 100%;
    background: var(--ion-background-color);
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
}

div#search-wrapper h1 {
    margin-top: 0;
}

div#container {
    padding-top: 25vh;
}

.characterItem.downloaded ion-icon { 
    display:none;
}

.character-item-wrapper ion-icon {
    margin-top: 0.8rem;
}

#header {
  font-size:3rem;
  color:var(--ion-text-color);
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
    color: var(--ion-dark-text-color);
}
span.downloaded-label {
    text-transform: uppercase;
    background: #ff0000;
    padding: 0.3rem 0.5rem;
    display: inline-block;
    margin-top: 0.5rem;
    border-radius: 1rem;
    font-size: 0.8em;
    color: #fff;
    box-shadow: 0 2px 3px rgba(0,0,0,0.3);
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


ion-item {
    width: 100%;
}

div.characterItem {
    width: 100%;
    overflow: hidden;
    position: relative;
    border-radius: 1rem;
    z-index: 1;
    display: inline-block;
}

ion-item {
    margin: 0 0 1rem;
}


span.author-name {
    width: 100%;
    display: inline-block;
    color: #000;
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

.characterItem.downloading .downloading-status {
    display:block;
}

.downloading-status {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    text-align: center;
    z-index: 10;
    padding: 15% 0;
    display:none;
}

.downloading-status ion-icon{
    animation: rotate infinite 2s;
    -webkit-animation: rotate infinite 2s;
}

@keyframes rotate {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}

.ball-loader {
  width: 100px;
  height: 23.3333333333px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
}

.ball-loader-ball {
  will-change: transform;
  height: 23.3333333333px;
  width: 23.3333333333px;
  border-radius: 50%;
  background-color: var(--ion-color-primary);
  position: absolute;
  -webkit-animation: grow 1s ease-in-out infinite alternate;
          animation: grow 1s ease-in-out infinite alternate;
}
.ball-loader-ball.ball1 {
  left: 0;
  transform-origin: 100% 50%;
}
.ball-loader-ball.ball2 {
  left: 50%;
  transform: translateX(-50%) scale(1);
  -webkit-animation-delay: 0.33s;
          animation-delay: 0.33s;
}
.ball-loader-ball.ball3 {
  right: 0;
  -webkit-animation-delay: 0.66s;
          animation-delay: 0.66s;
}

@-webkit-keyframes grow {
  to {
    transform: translateX(-50%) scale(0);
  }
}

@keyframes grow {
  to {
    transform: translateX(-50%) scale(0);
  }
}

div#searching-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--ion-background-color);
    opacity: 0.8;
    z-index: 10;
}
</style>