<template>
    <div ref="healingAnimation" class='squares' :class="{'visible': showAnimation}">
        <div v-for="n in 10" :key="n" class='square' :style='randomHealStyle(n)'></div>
    </div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'HealAnimation',

  setup() {
      const showAnimation = ref(false);

      const play = () => {
          console.log("Show animation");
          showAnimation.value = true;
          setTimeout(() => { showAnimation.value = false;}, 1000);
      }

      return {
          showAnimation,
          play
      }
  },

  methods: {
      randomHealStyle(n: number) {
          return {
              "--index":  n,
              "--delay": (Math.random() * 5) + "s",
              "--duration": ((Math.random() * 2) + 2) + "s",
              "--blur": (Math.random() * 5) + "px"
          };
      }
  }
});
</script>

<style>

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

.squares.visible {
    visibility: visible;
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

  -webkit-animation-delay: var(--delay);
  animation-delay: var(--delay);
  -webkit-animation-duration: var(--duration);
  animation-duration: var(--duration);
  -webkit-filter: blur(var(--blur));
  filter: blur(var(--blur));
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
</style>
      