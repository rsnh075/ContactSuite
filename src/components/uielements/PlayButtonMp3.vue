<template>
  <div data-e2e="play-audio-button">
    <a :class="['button__icon button__icon-play--small' , {'button__icon--disabled' : disabled}]" @click="playAudio" ref="btn">
      <span v-html="playerIcon.play"></span>
    </a>
  </div>
</template>

<script>
  /**
   * Play button
   *  *
   * @author Wim Jurriaans <wjurriaans@contactmakers.nl>
   *
   * @version 1.0
   *
   * @todo
   *
   *
   */

  export default {
    name: 'PlayButtonMp3',
    props: {
      soundUrl : {
        type    : String,
        default : '',
      },
      volume : {
        type    : Number,
        default : 50,
      },
      disabled : {
        type    : Boolean,
        default : false,
      }
    },
    data() {
      return {
        playerIcon     : {
          play: '&#xF40A',
          load: '&#xF771',
          stop: '&#xf4DB'
        },
        uid            : '_' + Math.random().toString(32).substring(2, 11),
        mp3Player      : [],
        audioIsPlaying : false,
        sound          : null,
      }
    },
    watch: {
      soundUrl: function(newUrl, oldUrl) {
        if(newUrl !== oldUrl) {
          this.sound = this.soundUrl;
        }
      }
    },
    methods: {
      setAudioPlayerStatus(target, status) {
        switch (status) {
          case 'stopped':
            target.innerHTML = this.playerIcon.play;
            target.classList.remove('status--loading');
            this.audioIsPlaying = false;
            break;
          case 'loading':
            target.innerHTML = this.playerIcon.load;
            target.classList.add('status--loading');
            this.audioIsPlaying = true;
            break;
          case 'playing':
            target.innerHTML = this.playerIcon.stop;
            target.classList.remove('status--loading');
            this.audioIsPlaying = true;
            break;
        }
      },
      playAudio(evt) {
        let _target;

        if(typeof evt !== 'undefined')
          _target = evt.target;
        else
          _target = this.$refs['btn'];

        this.mp3Player.forEach((player, index) => {
          const _playMp3 = soundUrl => {
            if(player !== null) {
              player.addEventListener('loadeddata', _ => {
                if(index == this.mp3Player.length -1) {
                  this.setAudioPlayerStatus(_target, 'playing');
                  this.$emit('playPressed');
                }
                player.play();
              });
              player.addEventListener('error', e => {
                if(index == this.mp3Player.length -1) {
                  this.setAudioPlayerStatus(_target, 'stopped');
                  console.error('Error: ', e.target.error.message);
                }
              });
              player.addEventListener('ended', _ => {
                if(index == this.mp3Player.length -1) {
                  this.setAudioPlayerStatus(_target, 'stopped');
                }
              });
              if(index == this.mp3Player.length -1) {
                this.setAudioPlayerStatus(_target, 'loading');
              }
              player.src = soundUrl;
            }
          };

          if(!this.audioIsPlaying) {
            _playMp3(this.sound);
          } else {
            player.pause();
            if(index == this.mp3Player.length -1) {
              this.setAudioPlayerStatus(_target, 'stopped');
            }
          }
        });
      },
      setVolume(vol) {
        this.mp3Player.forEach(player => {
          player.volume = vol/100;
        });
      },
      stopPlaying() {
        this.mp3Player.forEach(player => {
          player.pause();
        });
        this.setAudioPlayerStatus(this.$refs['btn'], 'stopped');
      },
      setOutPutDevice(deviceIds) {
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
                this.mp3Player[index].volume = this.volume/100;
            } else if(this.mp3Player[index] && id !== '') {
                this.mp3Player[index] = null;
            } else if(!this.mp3Player[index] && id !== '') {
                this.mp3Player.push(new Audio());
                if (typeof this.mp3Player[index].setSinkId == "function") {
                    this.mp3Player[index].setSinkId(id)
                    .then(() => {})
                    .catch((err) => console.error(err));
                } else {
                    console.error('Type error, setSinkId is not a function');
                }
                this.mp3Player[index].volume = this.volume/100;
            }
        });
      },
    },
    mounted() {
      this.mp3Player.push(new Audio());
      this.sound               = this.soundUrl;
      this.mp3Player[0].volume = parseFloat(this.volume/100);
    },
  }
</script>
