<template>
  <div @mouseup="stopPlaying" @mouseleave="stopPlaying" @mousedown="startPlaying" data-e2e="volume-slider">
    <RangeSlider
      :label   = label
      :min     = min
      :max     = max
      :step    = step
      :value   = value
      @update  = updateValue
    />
  </div>
</template>

<script>
  import RangeSlider from './RangeSlider.vue';

  export default {
    name : 'VolumeSlider',
    props : {
      label : {
        type    : String,
        default : 'Label',
      },
      min : {
        type    : Number,
        default : 0,
      },
      max : {
        type    : Number,
        default : 0,
      },
      step : {
        type    : Number,
        default : 1,
      },
      value : {
        type    : Number,
        default : 0,
      },
      sound : {
        type : String,
        default : '',
      },
      iscalling : {
        type : Boolean,
        default : false,
      }
    },
    data: () => {
      return {
        mp3Player       : [],
        audioIsLoaded   : false,
        sliderTimeoutId : null,
      }
    },
    components: {
      RangeSlider,
    },
    watch: {
      sound: function(newUrl, oldUrl) {
        this.audioIsLoaded = newUrl === oldUrl;
      },
    },
    computed: {
      setWidth : function() {
        return function(val) {
          return `width:${val}%`;
        }
      },
    },
    methods: {
      updateValue(val) {
        clearTimeout(this.sliderTimeoutId);
        this.sliderTimeoutId = setTimeout(() => {
          this.mp3Player.forEach(player => {
            player.volume = val/100;
          });
          this.$emit('update', val);
        }, 100);
      },
      startPlaying() {
        if(!this.iscalling) {
          this.playAudio(this.sound);
        }
      },
      stopPlaying() {
        this.mp3Player.forEach(player => {
          player.loop = false;
        });
      },
      hardStopPlaying() {
        this.mp3Player.forEach(player => {
          player.pause();
          player.loop = false;
        });
      },
      playAudio(soundUrl) {
        this.mp3Player.forEach((player, index) => {
          player.addEventListener('loadeddata', _ => {
            if(index == this.mp3Player.length -1) {
              this.audioIsLoaded = true;
            }
            player.play();
          });
          player.addEventListener('error', _ => {

          });
          player.addEventListener('ended', _ => {

          });
          player.src = soundUrl;
        });
      },
      setOutPutDevice(deviceIds) {
        this.hardStopPlaying();
        this.mp3Player = [];
        deviceIds.forEach((id, index) => {
            if(this.mp3Player[index] && id !== '') {
                if (typeof this.mp3Player[index].setSinkId == "function") {
                    this.mp3Player[index].setSinkId(id)
                    .then(() => {})
                    .catch((err) => console.error(err));
                } else {
                    console.error('Type error, setSinkId is not a function');
                }
                this.mp3Player[index].loop   = true;
                this.mp3Player[index].volume = this.value/100;
            } else if(this.mp3Player[index] && id !== '') {
                this.mp3Player[index].pause();
                this.mp3Player[index].src = '';
                this.mp3Player[index] = null;
            } else if(!this.mp3Player[index] && id !== '') {
                this.mp3Player.push(new Audio());
                this.mp3Player[index].loop = true;
                if (typeof this.mp3Player[index].setSinkId == "function") {
                    this.mp3Player[index].setSinkId(id)
                    .then(() => {})
                    .catch((err) => console.error(err));
                } else {
                    console.error('Type error, setSinkId is not a function');
                }
                this.mp3Player[index].volume = this.value/100;
            }
        });
      }
    },
    mounted() {
      this.mp3Player.push(new Audio());
      this.mp3Player[0].loop = true;
      this.mp3Player[0].volume = this.value/100;
    },
  }
</script>
