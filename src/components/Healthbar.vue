<template>
    <div class='healthbar-wrapper'>
        <ion-grid>
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
        </ion-grid>
    </div>
</template>

<script lang="ts">
import { IonGrid, IonCol, IonRow, IonButton, IonIcon } from '@ionic/vue';
import { addOutline, removeOutline} from 'ionicons/icons'

import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'Healthbar',
  components: { IonGrid, IonCol, IonRow, IonButton, IonIcon },

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
    }
  },

  watch: {
    maxHealth(newValue) {
      this.current = newValue;
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
#description img {
  display:none!important;
}

.health-values {
    font-size: 3em;
}
</style>