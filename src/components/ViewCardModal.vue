<template>
    <div id='modal-card-wrapper'>
        
        <card @click="flip" :card="card" :cardback="cardback"  :faceUp="cardFaceUp" :scale='2' 
            :ruleCard="ruleCard" :color="color"></card>
        <h5 v-if="origin=='hand'">Tap Card to Flip</h5>
    </div>
    <div id='card-options'>
        <div v-if="origin=='hand'">
            <ion-button expand="block" @click="play">Play / Discard</ion-button>
            <ion-button expand="block" @click="close">Close</ion-button>
        </div>
        <div v-if="origin=='discard'">
            <ion-button expand="block" @click="play">Add to Hand</ion-button>
            <ion-button expand="block" @click="close">Close</ion-button>
        </div>
        <div v-if="origin != 'discard' && origin != 'hand'">
            <ion-button expand="block" @click="toggleRuleCard(!card.pinned)">{{card.pinned? "Unpin" : "Pin"}}</ion-button>
            <ion-button expand="block" @click="close">Close</ion-button>
        </div>


    </div>

</template>

<script lang="ts">
    import Card from "@/components/Card.vue"
    import { IonButton, modalController } from '@ionic/vue';
    import { defineComponent } from 'vue';

    const PLAYED_CARD = true;
    const RETURN_TO_HAND = false;

    export default defineComponent({
        name: 'ViewCardModal',
        components: { Card, IonButton },
        data(){
            return {
                cardFaceUp: true
            }
        },

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
            origin: { 
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

        watch: {
            faceUp: function(value){
                this.cardFaceUp = value;
            }
        },

        mounted(){
            console.log(this.card);
        },

        methods: {
            flip: function(){
                this.cardFaceUp = !this.cardFaceUp;
            },
            close: function(){
                modalController.dismiss({
                    played: RETURN_TO_HAND,
                    cardId: this.card.id,
                    origin: this.origin
                });
            },
            play: function(){
                modalController.dismiss({
                    played: PLAYED_CARD, 
                    cardId: this.card.id,
                    origin: this.origin
                });
            },
            toggleRuleCard: function(pinned: boolean){
                modalController.dismiss({
                    played: true,
                    cardId: this.card.id,
                    origin: "rules",
                    pinned: pinned
                });
            }
        }
        
    });
</script>

<style scoped>
    #modal-card-wrapper::v-deep(.card) {
        margin: 1rem auto;
    }
    h5{
        color: #000;
        text-align: center;
    }
</style>