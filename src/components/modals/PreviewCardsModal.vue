<template>
    <div class='preview-modal-wrapper ion-padding'>
        <h1> {{deck.hero.name}} </h1>
        <ion-grid>
            <ion-row>
                <ion-col>                    
                    <ion-icon class="characterTypeIcon" :icon="'assets/icon/' + characterType(deck.hero.isRanged) + '.svg'"></ion-icon>
                </ion-col>
                <ion-col>
                    <h3 style='margin:0;'><ion-icon :icon="heart"></ion-icon> {{deck.hero.hp}}</h3>
                </ion-col>
                <ion-col>
                    <h3 style='margin:0;'><ion-icon :icon="resize"></ion-icon> {{deck.hero.move}}</h3>
                </ion-col>
            </ion-row>
        </ion-grid>
        
        {{deck.hero.specialAbility}}
        <ion-grid class='sidekick-info-wrapper' v-if="deck.sidekick.quantity > 0" style='margin-top:0.8rem;'>
            <ion-row>
                <ion-col>
                    <strong>Sidekick:</strong> {{deck.sidekick.name}}
                </ion-col>
                <ion-col v-if="deck.sidekick.quantity > 1">
                    x{{deck.sidekick.quantity}}
                </ion-col>
                <ion-col v-else>
                    <ion-icon :icon="heart"></ion-icon> {{deck.sidekick.hp}}
                </ion-col>
            </ion-row>
        </ion-grid>

          <div v-if="deck.extraCharacters.length > 0" class='card-type-cards ion-padding' style='margin-top:1.5rem;'>
            <div v-for="(character,i) in deck.extraCharacters" :key="i" class='listed-card'>
                <h3>{{character.hero.name}} <span><ion-icon :icon="heart"></ion-icon> {{character.hero.hp}}</span> <span><ion-icon :icon="resize"></ion-icon> {{character.hero.move}}</span></h3>
                
                <ion-icon class="characterTypeIcon" :icon="'assets/icon/' + characterType(character.hero.isRanged) + '.svg'"></ion-icon><br/>
                <p>{{character.hero.specialAbility}}</p>
                <ion-grid class='sidekick-info-wrapper' v-if="character.sidekick.quantity > 0">
                    <ion-row>
                        <ion-col>
                            <strong>Sidekick:</strong> {{character.sidekick.name}} 
                        </ion-col>
                        <ion-col v-if="character.sidekick.quantity > 1">
                            x{{character.sidekick.quantity}}
                        </ion-col>
                        <ion-col v-else>
                            <ion-icon :icon="heart"></ion-icon> {{character.hero.hp}}
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>
          </div>

          <div v-for="cardType in Object.keys(cards)" :key="cardType">
              <h2 :class='cardType' class='card-type-label'>
                  <ion-icon :icon="'assets/icon/' + cardType + '.svg'" :class='cardType'></ion-icon> {{cardType}} cards
                </h2>
                <div class='card-type-cards ion-padding'>
                    <div class='listed-card' v-for="(card, i) in cards[cardType]" :key="cardType+'-card-' + i">
                        <ion-grid>
                            <ion-row>
                                <ion-col size="10">
                                    <h3>{{card.title}}<br/>
                                    <span v-if="card.value !== null">Value: {{card.value}}, </span>Boost: {{card.boost}}</h3>
                                </ion-col>
                                <ion-col size="2" class='card-count'>
                                     x{{card.quantity}} 
                                </ion-col>
                            </ion-row>
                            <ion-row>
                                <ion-col>
                                    <p v-if="!isEmpty(card.immediateText)"><strong>Immediate:</strong> {{card.immediateText}}</p>
                                    <p v-if="!isEmpty(card.basicText)">{{card.basicText}}</p>
                                    <p v-if="!isEmpty(card.duringText)"><strong>During:</strong> {{card.duringText}}</p>
                                    <p v-if="!isEmpty(card.afterText)"><strong>After:</strong> {{card.afterText}}</p>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </div>
                </div>
          </div>

        <ion-fab vertical="top" horizontal="end" slot="fixed" color="primary">
            <ion-fab-button @click="close" color="primary">
                <ion-icon :icon="closeOutline"></ion-icon>
            </ion-fab-button>
        </ion-fab>
    </div>
</template>

<script lang="ts">
    import { modalController, IonIcon, IonFab, IonFabButton, IonGrid, IonRow, IonCol} from '@ionic/vue';
    import { defineComponent } from 'vue';
    import { closeOutline, heart, resize } from 'ionicons/icons'

     export default defineComponent({
        name: 'PreviewCardsModal',
        components: {
            IonIcon, IonFab, IonFabButton,IonGrid, IonRow, IonCol
        },

        setup(){
            return { closeOutline, heart, resize };
        },

        props: {
            deck: {
                required: true,
                type: Object
            }
        },

        computed: {
            cards(){
                const types = this.deck.cards.map((c: any) => { return c.type; });
                
                const result: Record<string,any>  = {};
                for(const t of types){         
                    result[t] = this.deck.cards.filter((c: any) => { return c.type == t; }).sort((a: any, b: any) => { return a.value < b.value? -1 : 1; });
                }

                console.log(result);
                return result;
            }
        },

        methods: {
            close: function(){
                modalController.dismiss();
            },

            isEmpty: function(text: string){
                return text == null || text == "";
            },

            characterType: function(isRanged: boolean){
                return isRanged? "ranged" : "melee";
            }
        }
        
    });
</script>

<style scoped>
.preview-modal-wrapper {
    overflow-y: scroll;
}

ion-list-header ion-icon {
    margin-right:1rem;
}
ion-list-header {
    text-transform: capitalize;
}
.listed-card h3 span {
    margin: 0 1rem;
}

.listed-card p {
    white-space: break-spaces;
    line-height: 1.5rem;
}
.card-type-label {
    padding: 0.8rem;
    border-radius: 1rem;
}

.card-type-label * {
    vertical-align: middle;
}

.card-type-label ion-icon {
    margin-right: 1rem;
}

.scheme{
    background: var(--um-scheme-color);

}
.attack{
    background: var(--um-attack-color);

}
.defence {
    background: var(--um-defense-color);

}
.versatile {
    background: var(--um-versatile-color);
}

h1 { 
    font-size:3rem;
    margin-top:0;
}
h2 {
    font-size: 2rem;
}


.listed-card h3 {
    margin-top: 0;
    border-bottom: 1px solid #565656;
    letter-spacing:1px;
}

.card-count {
    font-size: 2rem;
}


ion-icon.characterTypeIcon {
    font-size: 6rem;
    height: 2rem;
    display: inline-block;
}


.sidekick-info-wrapper {
    margin-bottom: 2rem;
    background: #444;
    border-radius: 0.5rem;
    padding: 0.8rem;
}

</style>