<template>
  <ion-page>
    <ion-header :translucent="true" class="ion-no-border">
      <ion-toolbar class="ion-no-border">
        <ion-buttons slot="start">
            <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>

      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :style='characterStyles' v-if="character != undefined">
      <ion-header collapse="condense" :translucent="true" class="ion-no-border">
        <ion-toolbar class="ion-no-border">
            <ion-buttons slot="start">
                <ion-back-button default-href="/"></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <div class='page-wrapper ion-text-center'>
        <div id='damage-animation' ref="damageAnimation" class='fade-out'></div>


        <div class='deco slide-in-bck-center'></div>
        
        <div class='card card-face-down slit-in-vertical'></div>
        <div id="healthbar-container" class="ion-padding">
          <character-slider 
            :allCharacters="allCharacters"
            @heal="showHealAnimation"
            @damage="showDamageAnimation">
          </character-slider>
          
          <ion-button :router-link="'/game/' + id" expand="block" >Start a Game</ion-button>

        </div>
      </div>

      <heal-animation ref="healAnimation"></heal-animation>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonToolbar, 
          IonBackButton, IonButtons, IonButton } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StorageService from "@/services/storage.service";

import HealAnimation from "@/components/effects/Heal.vue";
import CharacterSlider from "@/components/ui/CharacterSlider.vue"

import { Deck } from "@/types/Decks";

export default defineComponent({
  name: 'Character',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonButton,
    HealAnimation,
    CharacterSlider
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const storage = StorageService;
    storage.init();

    const id = ref("");
    id.value = route.params.id as string;

    const character = ref<Deck>();

    const loadCharacter = async () => {
      console.log("Load character " + id.value);
      character.value = await storage.get("character-" + id.value) as Deck;
      console.log("Character: ", character.value);
    }
    loadCharacter();


    const slideOpts = {
      initialSlide: 0,
      speed: 400
    };

    return { router, id, character, slideOpts};
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
  },

  computed: {
    cardback: function(): string {
      if(this.character != undefined && this.character.appearance.cardbackUrl != undefined){
        return this.character.appearance.cardbackUrl;
      }
      else{
        return "assets/leather-texture.jpg";
      }
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
    characterStyles: function(): Record<string,any> {
      if(this.character != null){
        return {
          "--characterBackground": 'url(' + this.cardback + ')',
          "--characterColor": this.character.appearance.highlightColour,
          "--cardCount": this.cardCount
        };
      }
      
      return {};
    },

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
    }
  },

  watch: {
    characterStyles(){      
      for(const key in this.characterStyles) {
        document.body.style.setProperty(key, this.characterStyles[key]);
      }
    }, 
  }

});
</script>

<style scoped>

ion-button.button-block {
    --border-radius: 20px;
}

ion-toolbar {
  --ion-toolbar-color	: #222!important;
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
  background-color: var(--characterColor);
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

@-webkit-keyframes fade-out{0%{opacity:1}100%{opacity:0}}@keyframes fade-out{0%{opacity:1}100%{opacity:0}}
.fade-out{-webkit-animation:fade-out .2s ease-out both;animation:fade-out .2s ease-out both}



</style>