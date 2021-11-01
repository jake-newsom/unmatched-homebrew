<template>
    <ion-grid class='sidekick-toggle-wrapper'>
        <ion-row>
            <ion-col v-for="(n,index) in sidekicks.length" :key="index">
                <div class='sidekick-toggle' :ref="'sidekickToggle' + index" @click="sidekicks[index] = !sidekicks[index]"> 
                    <transition-group name="sidekick">
                        <ion-icon :icon="'assets/icon/skull.svg'" v-if="sidekicks[index]" :style='characterColor'></ion-icon>
                        <ion-icon :icon="'assets/icon/skull.svg'" v-if="!sidekicks[index]" style='color:#ccc;'></ion-icon>
                    </transition-group>
                </div>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import { IonGrid, IonRow, IonCol, IonIcon } from "@ionic/vue";

export default defineComponent({
  name: 'SidekickToggles',

  components: {
      IonGrid, IonRow, IonCol, IonIcon
  },

  props: {
      "count": {
          type: Number,
          required: true
      },
      "color": {
          type: String,
          required: true
      }
  },

  setup(props) {
      const sidekicks = ref(new Array(props.count).fill(true));
      return {
          sidekicks
      }
  },

  computed: {
      characterColor(){
          return {
              "color": this.color
          }
      }
  }
});
</script>

<style>


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


</style>
      