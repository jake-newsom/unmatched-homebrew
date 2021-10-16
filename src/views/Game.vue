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

        <ion-grid style='height:40vh; overflow-y:scroll;'>
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
                    <ion-grid v-else class='sidekick-toggle-wrapper'>
                        <ion-row>
                            <ion-col v-for="(n,index) in character.sidekick.quantity" :key="index">
                                <div class='sidekick-toggle' :ref="'sidekickToggle' + index" @click="toggleSidekick(index)"> 
                                    <transition name="sidekick">
                                        <ion-icon :icon="'assets/icon/skull.svg'" v-if="sidekicks[index]" :style='{"color":character.color}'></ion-icon>
                                    </transition>
                                    <transition name="sidekick">
                                        <ion-icon :icon="'assets/icon/skull.svg'" v-if="!sidekicks[index]" :style='{"color":"#ccc"}'></ion-icon>
                                    </transition>
                                </div>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-col>
            </ion-row>
        </ion-grid>
            <!-- <ion-row>
                <ion-col>
                    <div id='draw-pile' @click='drawCard'>
                        <div v-if='cards.length == 0' id="empty-draw-pile" ></div>
                        
                        <div v-else id='draw-pile-cardback'>
                            <card :card="cards[0]" :cardback="character.cardback"  :faceUp="false"></card>
                            <span>x{{cards.length}}</span>
                        </div>
                    </div>
                </ion-col>
                <ion-col>
                    <div id='discard-pile' @click='discardHandVisible = !discardHandVisible'>
                        <div v-if='discard.length == 0' id="empty-discard-pile">No Discards</div>
                        <card v-else :card="discard[0]" :cardback="character.cardback"  :faceUp="true"></card>
                    </div>
                </ion-col>
            </ion-row> -->
        <ion-grid>
            <transition name="hand-drawer">
                <ion-row nowrap v-if="!discardHandVisible" id="hand-wrapper" class='hand-drawer'>
                    <ion-col>
                        <h3>Your Hand (x{{hand.length}}) - <a @click='discardHandVisible = !discardHandVisible'>View Discards</a></h3>
                        <div class='empty' v-if="hand.length == 0">
                            <span>No cards!</span>
                        </div>
                        <div class="horizontal-card-scroller" ref="cardScroller">
                            <card v-for="(card,index) in hand" 
                                @click="viewCard(card, 'hand')"
                                :card="card" 
                                :cardback="character.cardback" 
                                :faceUp="handFaceUp" 
                                :key="index"
                                :scale="0.8"></card>
                        </div>
                        <ion-button @click="drawCard">Draw (x{{cards.length}})</ion-button>
                        <ion-button v-if="hand.length > 0" @click="handFaceUp=!handFaceUp">Flip</ion-button>
                        <ion-button v-if="hand.length > 0" @click="hand=shuffle(hand)">Shuffle</ion-button>
                    </ion-col>
                </ion-row>
            </transition>

            <transition name="hand-drawer">
                <ion-row ref="discardHand" v-if="discardHandVisible" nowrap id="discard-pile-wrapper" class='hand-drawer'>
                    <ion-col>
                        <h3>Discard Pile - <a @click='discardHandVisible = !discardHandVisible'>View Hand</a></h3>
                        <div class='empty' v-if="discard.length == 0">
                            <span>No discarded cards!</span>
                        </div>
                        <div class="horizontal-card-scroller" ref="cardScroller">
                            <card v-for="(card,index) in discard" 
                                @click="viewCard(card, 'discard')"
                                :card="card" 
                                :cardback="character.cardback" 
                                :faceUp="true" 
                                :key="index"
                                :scale="0.8"></card>
                        </div>
                    </ion-col>
                </ion-row>
            </transition>
        </ion-grid>
        
        
        <div id='damage-animation' ref="damageAnimation" class='fade-out'></div>
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
import { IonContent, IonHeader, IonPage, IonToolbar, IonBackButton, IonButtons, IonGrid, IonRow, IonCol, modalController} from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StorageService from "@/services/storage.service";
import Card from "@/components/Card.vue";
import ViewCardModal from '@/components/ViewCardModal.vue';
import GraphicHealthbar from "@/components/GraphicHealthbar.vue";

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
    Card,
    GraphicHealthbar
  },

  setup() {
  
    const startingHandSize = ref(5);
    const discardHandVisible = ref(false);
    const handFaceUp = ref(true);
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
      color: "",
      cards: []
    });

    const sidekicks = ref<boolean[]>([]);

    const id = ref("");
    id.value = route.params.id as string;

    const cards = ref<Record<string,any>[]>([]);
    const hand = ref<Record<string,any>[]>([]);
    const discard = ref<Record<string,any>[]>([]);

    return { router, character, storage, id, cards, hand, discard, startingHandSize, discardHandVisible, handFaceUp, sidekicks};
  },

  async mounted(){
      /** load character from storage */
      this.character = await this.storage.get("character-" + this.id);
      console.log(this.character);

      if(this.character.sidekick.quantity > 0){
        for(let i = 0; i < this.character.sidekick.quantity; i++){
          this.sidekicks.push(true);
        }
      }

      /** initialize deck */
      this.initializeDeck();      

      for(let i = 0; i < this.startingHandSize; i++){
          this.draw();
      }

      console.log(this.hand);

  },


  methods: {
      
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
        },
        
      initializeDeck: function(){
          let cardCount = 0;
          for(let i = 0; i < this.character.cards.length; i++){
              for(let count = 0; count < this.character.cards[i].quantity; count++){
                  const temp = Object.assign({}, this.character.cards[i]);
                  temp.id = cardCount;
                  this.cards.push(temp);
                  cardCount++;
              }
          }
            this.cards = this.shuffle(this.cards);

          console.log(this.cards);
      }, 

      shuffle: function(cards: any[]){

        for(let i = cards.length -1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1)); 
            const temp = cards[i];
            cards[i] = cards[j];
            cards[j] = temp;
        }

        return cards;
      },

      draw: function(){
        const card = this.cards.pop();

        /** show card with tap to close */

        if(card != null){
            this.hand.unshift( card ); 
        }

        // setTimeout(() =>{ 
        //     const hand = this.$refs.cardScroller as HTMLElement;
        //     hand.scrollTo(hand.scrollWidth, 0);
        // }, 300);
        
      },


      handToDiscard: function(cardId: number){
          console.log("Play card: " + cardId);
          const card = this.hand.filter(function(c){ return c.id == cardId; })[0];
          this.hand = this.hand.filter(function(c){ return c.id != cardId; });
          if(card != null){
              this.discard.unshift(card);
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

      viewCard: async function(card: any, origin: string){
        const modal = await modalController
            .create({
                component: ViewCardModal,
                cssClass: 'view-card',
                componentProps: {
                    card: card,
                    cardback: this.character.cardback,
                    faceUp: true,
                    origin: origin
                },
            });

        modal.onDidDismiss().then((data: any) => {
            if(data.data.played == true){
                if(data.data.origin == "hand" ){
                    /** Played card from hand, send to discard */           
                    this.handToDiscard(data.data.cardId);
                }
                else{
                    this.discardToHand(data.data.cardId);
                }
            }
        });

        return modal.present();
      }

  }

});
</script>

<style scoped>

.healthbar-wrapper::v-deep(.health-values) {
    font-size: 1.4em;
    font-weight: bold;
}

.healthbar-wrapper ion-button {
    font-size: .6em;
}

#character-container h3, #ally-container h3, .sidekick-container h3{
    margin-top:0!important;
    text-align:center;
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
}
.horizontal-card-scroller::v-deep(.card){
    display: inline-block!important;
    margin-right: 1em;
}



.sidekick-toggle ion-icon {
    font-size: 4rem;
}

.sidekick-toggle {
    text-align: center;
}

.sidekick-toggle-wrapper {
    padding: 0!important;
}

.sidekick-toggle-wrapper ion-col {
    padding: 0!important;
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
    border-top-left-radius: 2rem;
    border-top-right-radius: 2rem;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background:#fff;
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
@-webkit-keyframes flip-in-ver-left{0%{-webkit-transform:rotateY(80deg);transform:rotateY(80deg);opacity:0}100%{-webkit-transform:rotateY(0);transform:rotateY(0);opacity:1}}@keyframes flip-in-ver-left{0%{-webkit-transform:rotateY(80deg);transform:rotateY(80deg);opacity:0}100%{-webkit-transform:rotateY(0);transform:rotateY(0);opacity:1}}
</style>