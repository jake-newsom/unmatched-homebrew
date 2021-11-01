<template>
    <div class='card-wrapper'>
        <transition name="card-flip" mode="out-in" appear>
            <div @click="$emit('click')" key="facedown" v-if="!faceUp" class='card card-face-down' :class='classList' :style="cssScale">  </div>
        </transition>
        
        <transition name="card-flip" mode="out-in" appear>
            <div @click="$emit('click')" key="faceup" v-if="faceUp && !ruleCard" class='card card-face-up' :class='classList' :style="cssScale">
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
            </div>
        </transition>
        <transition name="card-flip" mode="out-in" appear>

            <div @click="$emit('click')" key="rulecard" v-if="faceUp && ruleCard" 
                class='card card-face-up card-rulecard' 
                :class='classList' 
                :style="cssScale">
                <div class='title-wrapper'>{{card.title}}</div>
                <div class='content-wrapper'>{{card.content}}</div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import {  IonIcon } from '@ionic/vue';
// import { addOutline, removeOutline} from 'ionicons/icons'

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Card',
  components: {IonIcon },
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
    cardback: {
        type: String,
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
    },
    color: {
        type: String
    }
  },

  computed: {
      cssScale: function(){
          const data: any = {
              "--card-scale": this.scale
          };

          if(!this.faceUp){
              data['background-image'] = 'url(' + this.cardback + ')';
          }

          if(this.ruleCard){
              data['background'] = this.color;
          }
          return data;
      },
      classList: function(){
          return [this.class];
      }
  }
});
</script>

<style scope>
.card {
    width: calc(10em * var(--card-scale));
    height: calc(15em * var(--card-scale));
    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
    border-radius: calc(6pt * var(--card-scale));
    border: calc(4px * var(--card-scale)) solid #fff;
    overflow:hidden;
}

.card-face-up {
    background: #000;
}

.card-face-down {
    background-size: cover;
    background-position: center;
}

.title-wrapper {
    color: #fff;
    border-bottom: calc(0.2em*var(--card-scale)) solid #fff;
    padding: calc(0.4rem * var(--card-scale));
    font-size: calc(0.8rem * var(--card-scale));
    background: #000;
}


.content-wrapper {
    white-space: break-spaces;
    font-size: calc(0.7rem * var(--card-scale));
    padding: calc(0.3rem * var(--card-scale));
}

.image-wrapper {
    height: 60%;
}


.image-wrapper {
    background-size: cover;
    background-position: center;
    border-bottom: .2em solid #fff;
}

.boost-wrapper {
    color: #fff;
    width: 1.8em;
    height: 1.8em;
    border-radius: 50%;
    border: .2em solid #fff;
    line-height: 1.4em;
    text-align: center;
    position: absolute;
    right: .2em;
    top: -.9em;
    background: #000;
}

.info-wrapper {
    position: relative;
    height: 40%;
    color: #fff;
    font-size: calc(0.7em * var(--card-scale));
    padding:.5em;
    white-space:normal;
}

.card-title {
    color: #fff;
    text-transform: uppercase;
    font-size: .7em;
    border-bottom: .1em solid #fff;
    margin: 0;
    padding-bottom: .2em;
}

.top-left-info-wrapper {
    width: calc(1.55rem * var(--card-scale));
    background: #000;
    color: #fff;
    font-size: calc(0.6rem * var(--card-scale));
    font-weight: bold;
    position:relative;
    white-space: normal;
    border-right: calc(0.15em * var(--card-scale)) solid #fff;
}
.card-count-wrapper {
    position: absolute;
    bottom: 0;
    right: .2em;
    font-size: .4em;
}

.info-wrapper p {
    font-size: .65em;
}

.info-wrapper p span {
    text-transform: uppercase;
}

.card-type-wrapper {
    background: #0efaf9;
    /* padding: calc(0.2em * var(--card-scale)); */
    margin-bottom: 1em;
    position: relative;
    text-align:center;
}

.card-type-wrapper::after {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: calc(0.5em * var(--card-scale)) calc(0.58em * var(--card-scale)) 0 calc(.6em * var(--card-scale));
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    width: 0;
}

.top-left-info-wrapper::after {
    width: 0;
    height: 0;
    border-style: solid;
    border-width:  calc(.58em* var(--card-scale)) calc(.58em * var(--card-scale)) 0 calc(.58em * var(--card-scale));
    border-color: #000 transparent transparent transparent;
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    width: 0;
}

.top-left-info-wrapper::before {
    width: 0;
    height: 0;
    border-style: solid;
    border-width:  calc(0.7em* var(--card-scale)) calc(0.7em * var(--card-scale)) 0 calc(0.7em * var(--card-scale));
    border-color: #fff transparent transparent transparent;
    content: "";
    position: absolute;
    top: 100%;
    left: calc(-.1em * var(--card-scale));
    width: 0;
}


.card-character-wrapper {
    transform: rotate(-180deg);
    writing-mode: vertical-rl;
    margin-left: calc(.25em * var(--card-scale));
}


.card-type-wrapper.versatile{
    background: #6c4e8d;
}
.card-type-wrapper.versatile::after{
    border-color: #6c4e8d transparent transparent transparent;
}

.card-type-wrapper.defence{
    background: #2c76ac;
}
.card-type-wrapper.defence::after{
    border-color: #2c76ac transparent transparent transparent;
}

.card-type-wrapper.scheme{
    background: #fcbd71;
}
.card-type-wrapper.scheme::after{
    border-color: #fcbd71 transparent transparent transparent;
}

.card-type-wrapper.attack{
    background: #dc3034;
}
.card-type-wrapper.attack::after{
    border-color: #dc3034 transparent transparent transparent;
}
.card-type-wrapper ion-icon {
    width: 100%;
    height: calc(0.5em * var(--card-scale));
    margin-top: calc(0.1em * var(--card-scale));
}


@-webkit-keyframes flip-in-ver-left{0%{-webkit-transform:rotateY(80deg);transform:rotateY(80deg);opacity:0}100%{-webkit-transform:rotateY(0);transform:rotateY(0);opacity:1}}@keyframes flip-in-ver-left{0%{-webkit-transform:rotateY(80deg);transform:rotateY(80deg);opacity:0}100%{-webkit-transform:rotateY(0);transform:rotateY(0);opacity:1}}
.card-flip-enter-active{ 
    -webkit-animation:flip-in-ver-left .5s cubic-bezier(.25,.46,.45,.94) both;animation:flip-in-ver-left .5s cubic-bezier(.25,.46,.45,.94) both
}
.card-flip-leave-active{
    animation-duration:0s;
    -webkit-animation-duration:0s;
    transition-duration:0s;
    -webkit-transition-duration: 0s;
    display:none;
}
</style>