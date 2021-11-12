<template>
    <div class='card-wrapper'>
        <transition name="card-flip" mode="out-in" appear>
            <div @click="$emit('click')" key="facedown" v-if="!faceUp" class='card card-face-down' :class='classList' :style="cssScale">  </div>
        </transition>
        
        <transition name="card-flip" mode="out-in" appear>
            <div @click="$emit('click')" key="faceup" v-if="faceUp" class="card card-face-up" :class='classList' :style='cssScale'></div>

            <!-- <div @click="$emit('click')" key="faceup" v-if="faceUp && !ruleCard" class='card card-face-up' :class='classList' :style="cssScale">
                <div class='image-wrapper' :style="'background-image: url(' + card.imageUrl + ')'">
                    <div class='top-left-info-wrapper'>
                        <div :class='"card-type-wrapper " + card.type'>
                            <ion-icon :icon="'assets/icon/' + card.type + '.svg'" size="large"></ion-icon>
                            {{card.value}}
                        </div>
                        <div class='card-character-wrapper'>
                            {{card.characterName}}
                        </div>
                        <div class='top-left-angle'></div>
                    </div>
                </div>
                <div class='info-wrapper'>
                    <div v-if="card.boost > 0" class='boost-wrapper'>{{card.boost}}</div>
                    <h3 class='card-title'>{{card.title}}</h3>
                    <p v-if="card.basicText != ''">{{card.basicText}}</p>
                    <p v-if="card.immediateText != '' && card.immediateText != null">
                        <span>Immediately: </span>
                        {{card.immediateText}}
                    </p>
                    <p v-if="card.duringText != '' && card.duringText != null">
                        <span>During Combat: </span>
                        {{card.duringText}}
                    </p>
                    <p v-if="card.afterText != '' && card.afterText != null">
                        <span>After Combat: </span>
                        {{card.afterText}}
                    </p>
                    <div class='card-count-wrapper'>x{{card.quantity}}</div>
                </div>
            </div> -->
        </transition>
        <!-- <transition name="card-flip" mode="out-in" appear>

            <div @click="$emit('click')" key="rulecard" v-if="faceUp && ruleCard" 
                class='card card-face-up card-rulecard' 
                :class='classList' 
                :style="cssScale">
                <div class='title-wrapper'>{{card.title}}</div>
                <div class='content-wrapper'>{{card.content}}</div>
            </div>
        </transition> -->
    </div>
</template>

<script lang="ts">
// import {  IonIcon } from '@ionic/vue';
// import { addOutline, removeOutline} from 'ionicons/icons'

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Card',
//   components: {IonIcon },
  emits: ["click"],

  props: {
    card: {
        type: Object,
        required: true
    },
    faceUp: {
        type: Boolean,
        required: true
    },
    scale: {
        type: Number,
        default: 1
    },
    class: {
        type: String
    },
    ruleCard: {
        type: Boolean,
        default: false
    }
  },

  mounted(){
      console.log(this.card);
  },

  computed: {
      cssScale: function(){
          const data: any = {
              "--card-scale": this.scale,
              "--card-index": this.card.cardIndex
          };
          return data;
      },
      classList: function(){
          return [this.class];
      }
  }
});
</script>

