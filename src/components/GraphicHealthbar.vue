<template>
    <div class='healthbar-wrapper'>
        <ion-icon @click="damage" :icon="removeOutline"></ion-icon>
        <div class='healthbar'>
            <div class='healthbar-filled' :style='healthbarFillStyle'></div>
            <span>{{ current }}</span>
        </div>
        <ion-icon @click="heal" :icon="addOutline"></ion-icon>
        <!-- <ion-grid>
            <ion-row>
                <ion-col size="2">
                    <ion-button @click="damage">
                        <ion-icon :icon="removeOutline"></ion-icon>
                    </ion-button>
                </ion-col>
                <ion-col size="8" style='text-align:center;' class='health-values'>
                    {{ current }}
                </ion-col>
                <ion-col size="2">
                    <ion-button @click="heal">
                        <ion-icon :icon="addOutline"></ion-icon>
                    </ion-button>
                </ion-col>
            </ion-row>
        </ion-grid> -->
    </div>
</template>

<script lang="ts">
import { IonIcon } from '@ionic/vue';
import { addOutline, removeOutline} from 'ionicons/icons'

import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'GraphicHealthbar',
  components: { IonIcon },

  setup() {
      const current = ref(0);
      return {
        addOutline, removeOutline, current
      };
  },
  mounted(){
      this.current = this.maxHealth;
  },

  props: {
    maxHealth: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    }
  },

  watch: {
    maxHealth(newValue) {
      this.current = newValue;
    }
  },

  computed: {
      healthbarFillStyle: function(): Record<string,any>{
          return {
              width: ((this.current / this.maxHealth) * 100) + "%",
              background: this.color
          };
      }
  },

  methods:{
      damage: function(){
          if(this.current > 0){
              this.current--;
          }
          console.log("emit damage");
          this.$emit("damage");
      },
      heal: function(){
          this.current++;
          this.$emit("heal");
      }
  }
});
</script>

<style>
.healthbar-wrapper {
    border: 0.15em solid #ababab;
    border-radius: 2em;
    background: #e2e2e2;
}

.healthbar-wrapper ion-icon {
    width: 10%;
    display: inline-block;
    vertical-align:middle;
    padding: 0.4em 0;
}

.healthbar-wrapper .healthbar {
    width: 80%;
    display: inline-block;
    text-align: center;
    background: #b7b5b5;
    border-radius: 3rem;
    padding: 0.35rem;
    position:relative;
    overflow:hidden;
    vertical-align:middle;
}

.healthbar-wrapper span { 
    font-weight:bold;
    z-index:10;
    position:relative;
    color:#fff;
    text-shadow: 0 0 6px #000, 0 0 3px #000;
}

.healthbar-filled {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 3rem;
    background: rgb(172, 106, 215);
    box-shadow: inset 0 -5px 10px rgb(0 0 0 / 20%);
}

</style>