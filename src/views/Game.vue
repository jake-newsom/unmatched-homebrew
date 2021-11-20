<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
            <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title v-if="showCounter">
            {{counterLabel}}: {{counter}}
        </ion-title>
        <ion-buttons slot="end" v-if="showCounter">
            <ion-button @click="counter--"><ion-icon :icon="removeCircleOutline"></ion-icon></ion-button>
            <ion-button @click="counter++"><ion-icon :icon="addCircleOutline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :style='cardStyles' v-if="character != undefined">
      
        <div id="searching-wrapper" v-if="loadingImages">
            <div class="ball-loader">
                <div class="ball-loader-ball ball1"></div>
                <div class="ball-loader-ball ball2"></div>
                <div class="ball-loader-ball ball3"></div>
            </div>
        </div>
      <ion-header collapse="condense">
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button default-href="/"></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
      </ion-header>

        <ion-grid style='height:50vh; overflow-y:scroll;'>
            <ion-row v-if="hasruleCards">
                <ion-col>
                    <ion-button expand="block" size="small" @click='visibleHand="rules"'>View Rule Cards</ion-button>
                </ion-col>
            </ion-row>
            <ion-row>
                <ion-col>                    
                    <character-slider 
                        :allCharacters="allCharacters"
                        @heal="showHealAnimation"
                        @damage="showDamageAnimation">
                    </character-slider>
                </ion-col>
            </ion-row>
        </ion-grid>

        <ion-grid>
            <ion-row id='pinned-rule-card' v-if="hasruleCards && pinnedRuleCard != null && pinnedRuleCard != undefined">
                <ion-col>
                    <card
                        :scale="0.8"
                        :card="pinnedRuleCard"
                        :ruleCard="true"
                        :faceUp="true"
                        @click="viewCard(pinnedRuleCard, 'rules', true)">
                    </card>
                </ion-col>
            </ion-row>
            <transition-group name="hand-drawer" appear>
                <ion-row nowrap v-if="visibleHand == 'hand'" id="hand-wrapper" class='hand-drawer'>
                    <ion-col>
                        <h3>Hand (x{{hand.length}}) - <a @click='visibleHand="discard"'>View Discards</a></h3>
                        <div class='empty' v-if="hand.length == 0">
                            <span>No cards!</span>
                        </div>
                        <transition-group name="hand-list" tag="div" class="horizontal-card-scroller" ref="cardScroller">
                            <card v-for="card in hand" 
                                @click="viewCard(card, 'hand')"
                                :card="card" 
                                :faceUp="handFaceUp" 
                                :key="card.id"
                                :scale="0.8"
                                class="hand-list-item"></card>
                        </transition-group>
                        <ion-button :disabled="cards.length == 0" @click="drawCard">Draw (x{{cards.length}})</ion-button>
                        <ion-button v-if="hand.length > 0" @click="handFaceUp=!handFaceUp">Flip</ion-button>
                        <ion-button v-if="hand.length > 0" @click="shuffleHand">Shuffle</ion-button>
                    </ion-col>
                </ion-row>
                <ion-row ref="discardHand" v-if="visibleHand == 'discard'" nowrap id="discard-pile-wrapper" class='hand-drawer'>
                    <ion-col>
                        <h3>Discard - <a @click='visibleHand="hand"'>View Hand</a></h3>
                        <div class='empty' v-if="discard.length == 0">
                            <span>No discarded cards!</span>
                        </div>
                        <transition-group v-else name="hand-list" tag="div" class="horizontal-card-scroller" ref="cardScroller">
                            <card v-for="(card,index) in discard" 
                                @click="viewCard(card, 'discard')"
                                :card="card" 
                                :faceUp="true" 
                                :key="index"
                                :scale="0.8"></card>
                        </transition-group>
                    </ion-col>
                </ion-row>
                <ion-row ref="rulesHand" v-if="visibleHand == 'rules' && hasruleCards" nowrap id="discard-pile-wrapper" class='hand-drawer'>
                    <ion-col>
                        <h3>Rule Cards - <a @click='visibleHand="hand"'>View Hand</a></h3>
                        <div class="horizontal-card-scroller" ref="cardScroller">
                            <card v-for="(card,index) in character.ruleCards" 
                                @click="viewCard(card, 'rules', true)"
                                :card="card" 
                                :faceUp="true" 
                                :key="index"
                                :ruleCard="true"
                                :scale="0.8"></card>
                        </div>
                    </ion-col>
                </ion-row>
            </transition-group>
        </ion-grid>
        
        
        <div id='damage-animation' ref="damageAnimation" class='fade-out'></div>
        <heal-animation ref="healAnimation"></heal-animation>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonToolbar, IonBackButton, IonButtons, IonGrid, IonRow, IonCol, 
            IonButton, modalController, IonIcon, IonTitle } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StorageService from "@/services/storage.service";
import Card from "@/components/Card.vue";
import ViewCardModal from '@/components/ViewCardModal.vue';
import HealAnimation from "@/components/effects/Heal.vue";
import CharacterSlider from "@/components/ui/CharacterSlider.vue"

import { addCircleOutline, removeCircleOutline } from "ionicons/icons"

import { Capacitor } from '@capacitor/core';
import DownloadService from '@/services/download.service';
import CardApiService from '@/services/cardapi.service';

import { Deck } from "@/types/Decks";


export default defineComponent({
  name: 'Game',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonBackButton,
    IonButtons, 
    IonGrid, 
    IonRow,
    IonCol,
    IonButton,
    Card,
    HealAnimation,
    CharacterSlider,
    IonTitle,
    IonIcon,
  },

  setup() {
  
    const startingHandSize = ref(5);
    const visibleHand = ref("hand");
    const handFaceUp = ref(true);
    const route = useRoute();
    const router = useRouter();
    const storage = StorageService;
    storage.init();

    const id = ref("");
    const cardSheet = ref("");
    id.value = route.params.id as string;


    const loadingImages = ref(false);
    
    const loadCardSheet = async () => {
        loadingImages.value = true;
        const filepath = await DownloadService.loadCardImages(id.value);
        console.log("file path is " + filepath);

        cardSheet.value = Capacitor.convertFileSrc(filepath);
        console.log("cardsheet value: " + cardSheet.value);

        const img = new Image();
        img.onload = () => {
            document.body.style.setProperty("--cards", 'url(' + cardSheet.value + ')');
            loadingImages.value = false;
        }
        img.src = cardSheet.value;

        
    }

    if( Capacitor.isNativePlatform() ){
        loadCardSheet();
    }
    else{
        cardSheet.value = CardApiService.cardImagesBaseURL(id.value);
    }

    const slideOpts = {
      initialSlide: 0,
      speed: 400
    };
    
    const character = ref<Deck>();

    const loadCharacter = async () => {
      console.log("Load character " + id.value);
      character.value = await storage.get("character-" + id.value) as Deck;
      console.log("Character: ", character.value);
    }
    loadCharacter();

    const counter = ref(0);
    const showCounter = ref(false);
    const counterLabel = ref("Counter");
    const loader = ref<any>(null);


    const cards = ref<Record<string,any>[]>([]);
    const hand = ref<Record<string,any>[]>([]);
    const discard = ref<Record<string,any>[]>([]);

    return { loadingImages, router, character, storage, id, cards, hand, discard, startingHandSize, visibleHand, handFaceUp,
        addCircleOutline, removeCircleOutline, counter, counterLabel, showCounter, loader, cardSheet, slideOpts};
  },

  async mounted(){
      /** load character from storage */
      this.character = await this.storage.get("character-" + this.id);
      console.log(this.character);

      /** initialize deck */
      this.initializeDeck();      

      for(let i = 0; i < this.startingHandSize; i++){
          this.draw();
      }

      console.log(this.hand);

  },


  methods: {

      loadedImage() {
          if(this.loadedImage != null){
            this.loader.dismiss();
          }
      },
      
        showHealAnimation(){
            (this.$refs.healAnimation as any).play();
        },

        showDamageAnimation(){
            console.log("damage");
            (this.$refs.damageAnimation as HTMLElement).style.display = "block";
            setTimeout(() => { (this.$refs.damageAnimation as HTMLElement).style.display = "none"}, 500);
        },

        
      initializeDeck: function(){
          let counterSuggestions: string[] = [];
          let cardCount = 0;

          let cardIndex = 0;
          
          if(this.character != undefined){
            if(this.character.cards != undefined){
                for(let i = 0; i < this.character.cards.length; i++){
                    for(let count = 0; count < this.character.cards[i].quantity; count++){
                        const temp: Record<string,any> = Object.assign({}, this.character.cards[i]);
                        temp.id = cardCount;
                        temp.cardIndex = cardIndex;
                        this.cards.push(temp);
                        cardCount++;
                    }
                    const tSuggestions = this.checkCardForCounters(this.character.cards[i]);
                    counterSuggestions.push(...tSuggestions);
                    cardIndex++;
                }
            }
            cardIndex++; //for the main hero card

            if(this.character.extraCharacters != undefined){
                for(let i = 0; i < this.character.extraCharacters.length; i++){
                    this.character.extraCharacters[i].cardIndex = cardIndex;
                    cardIndex++;
                }
            }

            if(this.character.ruleCards != undefined){
                for(let i = 0; i < this.character.ruleCards.length; i++){
                    this.character.ruleCards[i].id = i;
                    this.character.ruleCards[i].pinned = false;
                    this.character.ruleCards[i].cardIndex = cardIndex;
                    const tSuggestions = this.checkCardForCounters(this.character.ruleCards[i]);
                    counterSuggestions.push(...tSuggestions);
                    cardIndex++;
                }
            }

            counterSuggestions.push(...this.checkStringForCounters(this.character.hero.specialAbility));
            
          }


            this.shuffleDeck();
            this.shuffleHand();

            counterSuggestions = counterSuggestions.filter((s) => { 
                const common = this.commonLabels.includes(s);
                return s.constructor == String && !common;
            });
            if(counterSuggestions.length > 0){
                this.counterLabel = counterSuggestions[0];
                this.showCounter = true;
            }
            else{
                this.showCounter = false;
            }

          console.log(this.cards);
      }, 

      checkStringForCounters: function(text: string): string[] {         
        const caps = [...text.matchAll(/([A-Z]{2,})/g)];
        const suggestions = caps.map((c) => { return c[0]; });
        return suggestions;
      },

      checkCardForCounters: function(card: any): string[]{
          let counters: string[] = [];

          const checkFields = ["afterText", "basicText", "immediateText", "duringText", "content"];
          for(const f in checkFields){
              if(Object.keys(card).includes(checkFields[f]) && card[checkFields[f]] != null){
                  const suggestions = [...card[ checkFields[f] ].matchAll(/(gain a )([a-zA-Z]*)/g)];
                  counters = [counters, ...suggestions.map((s) => { return s[2]; })];
              }
          }

          return counters;
      },

      shuffleHand: function(){
        for(let i = this.hand.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * i);
        
            const temp = this.hand[i];
            this.hand[i] = this.hand[randomIndex];
            this.hand[randomIndex] = temp;
        }
      },

      shuffleDeck: function(){
          for(let i = this.cards.length - 1; i > 0; i--){
              const randomIndex = Math.floor(Math.random() * i);
              const temp = this.cards[i];
              this.cards[i] = this.cards[randomIndex];
              this.cards[randomIndex] = temp;
          }
      },

      draw: function(){
        const card = this.cards.pop();
        if(card != null){
            this.hand.unshift( card ); 
        }        
      },


      handToDiscard: function(cardId: number){
          console.log("Play card: " + cardId);
          const card = this.hand.filter(function(c){ return c.id == cardId; })[0];
          this.hand = this.hand.filter(function(c){ return c.id != cardId; });
          if(card != null){
              this.discard.unshift(card);
        }
      },
      handToDraw: function(cardId: number){
          const card = this.hand.filter(function(c){ return c.id == cardId; })[0];
          this.hand = this.hand.filter(function(c){ return c.id != cardId; });
          if(card != null){
              this.cards.unshift(card);
              this.shuffleDeck();
        }
      },

      discardToHand: function(cardId: number){
          const card = this.discard.filter(function(c){ return c.id == cardId; })[0];
          this.discard = this.discard.filter(function(c){ return c.id != cardId; });
          if(card != null){
              this.hand.unshift(card);
          }
      },

      drawCard: function(){
          this.draw();
      },

      viewCard: async function(card: any, origin: string, ruleCard: boolean){

        const modal = await modalController
            .create({
                component: ViewCardModal,
                cssClass: 'view-card',
                componentProps: {
                    cardback: this.cardSheet,
                    card: card,
                    faceUp: true,
                    origin: origin,
                    ruleCard: ruleCard || false
                },
            });

        modal.onDidDismiss().then((data: any) => {
            if(data.data.played == true && data.data.origin != "rules"){
                if(data.data.origin == "hand" ){
                    if(data.data.sendTo != undefined && data.data.sendTo == "draw"){
                        this.handToDraw(data.data.cardId);
                    }
                    else{
                        /** Played card from hand, send to discard */           
                        this.handToDiscard(data.data.cardId);
                    }
                }
                else{
                    this.discardToHand(data.data.cardId);
                }
            }


            if(data.data.played && data.data.origin == "rules" && this.character != undefined && this.character.ruleCards != undefined){
                for(let i = 0; i < this.character.ruleCards.length; i++){
                    if(data.data.pinned && this.character.ruleCards[i].id != data.data.cardId){
                        this.character.ruleCards[i].pinned = false;
                    }
                    else if(data.data.pinned && this.character.ruleCards[i].id == data.data.cardId){
                        this.character.ruleCards[i].pinned = true;
                    }
                    else if(!data.data.pinned && this.character.ruleCards[i].id == data.data.cardId){
                        this.character.ruleCards[i].pinned = false;
                    }
                }
            }
        });

        return modal.present();
      },

      characterType(isRanged: boolean){
          console.log("Character type isRanged? ", isRanged);
           return isRanged? "ranged" : "melee";
      }

  },

  computed: {
      
    allCharacters: function(): any {
      if(this.character == undefined){
        return [];
      }

      const mainChar = {
        hero: this.character.hero,
        sidekick: this.character.sidekick
      }

      const allChars = [];
      allChars.push(mainChar);

      if(this.character.extraCharacters != undefined){
        for(let i = 0; i < this.character.extraCharacters.length; i++){
          allChars.push(this.character.extraCharacters[i]);
        }
      }

      return allChars;
    },

      commonLabels: function(): string[]{
          const characterSpecific: string[] = [];
          if(this.character != undefined){
            characterSpecific.push(this.character.hero.name);
            if(this.character.extraCharacters != undefined){
                characterSpecific.push(...this.character.extraCharacters.map((c: any) => { return c.name }));
            }
          }
          return ["BOOST", "ACTION", "LARGE", "SEPARATE", "IMMEDIATELY", "AFTER", "DURING", "COMBAT", ...characterSpecific];
      },

      hasruleCards: function(): boolean{
          return this.character != undefined && this.character.ruleCards != undefined && this.character.ruleCards.length > 0;
      }, 

      pinnedRuleCard: function(): any {
          if(this.character != undefined && this.character.ruleCards != undefined){
            return this.character.ruleCards.filter((c: any) => { return c.pinned == true; })[0];
          }
          
          return null;
      },

      heroType: function(): string {
          if(this.character != undefined && this.character.hero != undefined){
            return this.character.hero.isRanged? "range" : "melee";
          }
          
          return "melee";
      },
      
    cardCount: function(): number{
      let count = 0;
      if(this.character != undefined){
        count++;
        if(this.character.ruleCards != undefined){
          count += this.character.ruleCards.length; 
        }
        if(this.character.extraCharacters != undefined){
          count += this.character.extraCharacters.length;
        }
        if(this.character.cards != undefined){
          count += this.character.cards.length;
        }
      }

      return count;
    },
      
    cardStyles: function(): Record<string,any> {

      if(this.character != null){
        return {
          "--characterBackground": 'url(' + this.character.appearance.cardbackUrl + ')',
          "--characterColor": this.character.appearance.highlightColour,
          "--cards": 'url(' + this.cardSheet + ')',
          "--cardCount": this.cardCount
        };
      }
      
      return {};
    }
  },

  watch: {
    cardStyles(){    
      for(const key in this.cardStyles) {
        document.body.style.setProperty(key, this.cardStyles[key]);
      }
    }
  }

});
</script>

<style scoped>

ion-content {
    font-weight:300;
    letter-spacing:1px;
}

.healthbar-wrapper::v-deep(.health-values) {
    font-size: 1.4em;
    font-weight: bold;
}

.healthbar-wrapper ion-button {
    font-size: .6em;
}


.hand-drawer .empty {
    height: 8rem;
    text-align: center;
    border: 2px dashed #ccc;
    border-radius: 0.5rem;
    line-height: 8rem;
    color: #ccc;
}

.hand-drawer .empty span {
    vertical-align: middle;
}


div#draw-pile-cardback {
    margin: 0 auto;
    position: relative;
}

#draw-pile-cardback span {
    background: #fff;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-block;
    font-size: .8em;
    font-weight: bold;
    line-height: 30px;
    text-align: center;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
    position: absolute;
    right: -5px;
    bottom: -5px;
}


.horizontal-card-scroller {
    white-space: nowrap;
    overflow-x: scroll;
    -webkit-mask-image: linear-gradient(90deg, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%);
    padding-right: 15vw;
}
.horizontal-card-scroller::v-deep(.card-wrapper){
    display: inline-block!important;
    margin-right: 1em;
}




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

#discard-pile .card-face-up {
    transform: scale(0.54)!important;
    transform-origin: top left;
}


.hand-drawer {
    padding: 0.8rem 0.5rem 0.5rem;
    -webkit-border-top-left-radius: 2rem;
    -webkit-border-top-right-radius: 2rem;
    -moz-border-radius-topleft: 2rem;
    -moz-border-radius-topright: 2rem;
    border-top-left-radius: 1.2rem;
    border-top-right-radius: 1.22rem;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background:#565656;
    z-index: 10;
    max-height: 50vh;
}
.hand-drawer h3{
    margin-top:0;
}



.discard-drawer-enter-active, .hand-drawer-enter-active{
    -webkit-animation:slide-in-fwd-bottom .3s cubic-bezier(.25,.46,.45,.94) both;animation:slide-in-fwd-bottom .3s cubic-bezier(.25,.46,.45,.94) both
}
.discard-drawer-leave-active, .hand-drawer-leave-active{
    -webkit-animation:slide-in-fwd-bottom .3s cubic-bezier(.25,.46,.45,.94) both reverse;animation:slide-in-fwd-bottom .3s cubic-bezier(.25,.46,.45,.94) both reverse;
}
@-webkit-keyframes slide-in-fwd-bottom{0%{-webkit-transform:translateZ(-1400px) translateY(800px);transform:translateZ(-1400px) translateY(800px);opacity:0}100%{-webkit-transform:translateZ(0) translateY(0);transform:translateZ(0) translateY(0);opacity:1}}@keyframes slide-in-fwd-bottom{0%{-webkit-transform:translateZ(-1400px) translateY(800px);transform:translateZ(-1400px) translateY(800px);opacity:0}100%{-webkit-transform:translateZ(0) translateY(0);transform:translateZ(0) translateY(0);opacity:1}}









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


.sidekick-enter-active{
    -webkit-animation:flip-in-ver-left .5s cubic-bezier(.25,.46,.45,.94) both;animation:flip-in-ver-left .5s cubic-bezier(.25,.46,.45,.94) both;
}
.sidekick-leave-active{
    animation-duration:0s;
    -webkit-animation-duration:0s;
    transition-duration:0s;
    -webkit-transition-duration: 0s;
    display:none;
}
@-webkit-keyframes flip-in-ver-left{0%{-webkit-transform:rotateY(80deg);transform:rotateY(80deg);opacity:0}100%{-webkit-transform:rotateY(0);transform:rotateY(0);opacity:1}}@keyframes flip-in-ver-left{0%{-webkit-transform:rotateY(80deg);transform:rotateY(80deg);opacity:0}100%{-webkit-transform:rotateY(0);transform:rotateY(0);opacity:1}}



.hand-list-move {
  transition: transform 1s;
}

#pinned-rule-card {
    margin-top:-3rem;
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
    z-index: 150;
}
</style>