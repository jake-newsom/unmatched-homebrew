<template>
    <div class='character-slider-wrapper'>
        <swiper ref="swiper" pager="false" :options="slideOpts" :navigation="allCharacters.length > 1">
            <swiper-slide v-for="(character,index) in allCharacters" :key="index">
                <ion-grid>
                <ion-row class="character-container">
                    <ion-col size="4">
                        <ion-icon class="characterTypeIcon" :icon="'assets/icon/' + characterType(character.hero.isRanged) + '.svg'"></ion-icon>
                    </ion-col>
                    <ion-col size="6" class='name-wrapper ion-text-center'>
                        <h3>{{character.hero.name}}</h3>
                    </ion-col>
                    <ion-col class="ion-text-right" size="2">
                        <h3 v-if="character.hero.move > 0"><ion-icon class="characterMoveIcon" icon="assets/icon/move.svg"></ion-icon> {{character.hero.move}}</h3>
                    </ion-col>
                </ion-row>
                    <ion-row v-if="![undefined, ''].includes(character.hero.specialAbility)">
                        <ion-col class="ion-text-center">
                            <ion-text class='special-ability'>{{character.hero.specialAbility}}</ion-text>
                        </ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col>
                            <graphic-healthbar 
                                :maxHealth="character.hero.hp || 1" 
                                @heal="$emit('heal')" 
                                @damage="$emit('damage')"></graphic-healthbar>
                        </ion-col>
                    </ion-row>
                <ion-row v-if="character.sidekick != undefined && character.sidekick.quantity > 0" class='sidekick-container'>
                    <ion-col size="3">
                        <ion-icon class="characterTypeIcon" :icon="'assets/icon/' + characterType(character.sidekick.isRanged) + '.svg'"></ion-icon>
                    </ion-col>
                    <ion-col>
                        <h3>{{character.sidekick.name}}</h3>
                    </ion-col>
                    <ion-col size="3"></ion-col>
                </ion-row>
                <ion-row v-if="character.sidekick.quantity > 0">
                    <ion-col>
                        <graphic-healthbar 
                            v-if="character.sidekick.quantity == 1"
                            :maxHealth="character.sidekick.hp || 1" 
                            @heal="$emit('heal')" 
                            @damage="$emit('damage')"></graphic-healthbar>
                            
                        <sidekick-toggles v-else :count="character.sidekick.quantity"></sidekick-toggles>
                    </ion-col>
                </ion-row>
                </ion-grid>
            </swiper-slide>
        </swiper>
        <!-- <ion-text id='swipe-label' v-if="allCharacters.length > 1">
            <ion-icon :icon="chevronBackOutline"></ion-icon> Swipe <ion-icon :icon="chevronForwardOutline"></ion-icon>
        </ion-text> -->
    </div>
</template>

<script lang="ts">


  import 'swiper/swiper-bundle.min.css';
  import '@ionic/vue/css/ionic-swiper.css';
import { Swiper, SwiperSlide } from 'swiper/vue';
import SwiperCore, {
  Navigation
} from 'swiper';
SwiperCore.use([Navigation]);

import { defineComponent } from 'vue';
import { IonText, IonGrid, IonRow, IonCol, IonIcon } from "@ionic/vue";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons"

import SidekickToggles from "@/components/ui/SidekickToggles.vue"
import GraphicHealthbar from "@/components/GraphicHealthbar.vue"

export default defineComponent({
  name: 'CharacterSlider',

  components: {
      IonText, IonGrid, IonRow, IonCol, IonIcon,  SidekickToggles, GraphicHealthbar,
      Swiper, SwiperSlide
  },

  emits: ["heal", "damange"],

  props: {
      "allCharacters": {
          type: Array,
          required: true,
      }
  },

  setup(){
    const slideOpts = {
      initialSlide: 0,
      speed: 400
    };

    return { slideOpts, chevronBackOutline, chevronForwardOutline };

  },

  methods: {
      
      characterType(isRanged: boolean){
          return isRanged? "ranged" : "melee";
      }
  },

  mounted(){
      setTimeout( () => { window.dispatchEvent(new Event('resize')); }, 500);

  }
});
</script>

<style>

.character-container h3, #ally-container h3, .sidekick-container h3{
    margin-top:0!important;
    vertical-align:middle;
    width:100%;
    margin-bottom:0!important;
}

.character-container .name-wrapper {
     display: flex!important;
     align-content: center!important;
     align-items: center!important;
}
.special-ability{
    font-size:0.9rem;
}
ion-icon.characterTypeIcon {
    font-size: 6rem;
    height: 2rem;
    display: inline-block;
}

.character-info-wrapper h3 {
    display: inline-block;
    vertical-align: top;
    padding: 0.2rem 0.8rem 0;
}

ion-text#swipe-label {
    width: 100%;
    text-align: center;
    display: inline-block;
    font-family: 'Bebas';
    font-size: 1.2rem;
}
ion-text#swipe-label * {
    vertical-align: middle;
}

.swiper-button-prev {
    left: 5px;
}

.swiper-button-next {
    right:  5px;
}

.swiper-container {
    --swiper-navigation-size: 1rem;
    --swiper-navigation-color: var(--ion-toolbar-color);
}

.swiper-slide {
    transform: scale(0.8);
    transform-origin: center top
} 
</style>
      