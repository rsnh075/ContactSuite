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
    name: 'UiElement_105'
}
</script>
<script setup>
import { LanguageCode } from '../../helpers/languageLib';
import { IPCCCConfigurator } from './../../ipccc/js/configurator';
import { ref, onMounted } from 'vue';

const props = defineProps({
      currentvalue: { type: String, default : '45' },
      selectedcustomerid: { type: Number, default : -1 }
});

const playerIcon = ref({
          play: '&#xF40A',
          load: '&#xF771',
          stop: '&#xf4DB'
        });
const uid = ref('_' + Math.random().toString(32).substring(2, 11));
let promptPlayer = null;
let audioIsPlaying = false;

const setAudioPlayerStatus = (target, status) => {
    switch (status) {
        case 'stopped':
            target.innerHTML = playerIcon.value.play;
            target.classList.remove('status--loading');
            audioIsPlaying = false;
            break;
        case 'loading':
            target.innerHTML = playerIcon.value.load;
            target.classList.add('status--loading');
            audioIsPlaying = true;
            break;
        case 'playing':
            target.innerHTML = playerIcon.value.stop;
            target.classList.remove('status--loading');
            audioIsPlaying = true;
            break;
    }
}
  
const playAudio = evt => {
    let _target = evt.target;
    
    const _playPrompt = id => {
        //LANGUAGECODE IS VOOR NU ALLEEN NEDERLANDS
        IPCCCConfigurator.Request(selectedcustomerid, 'prompts', 'playprompt', LanguageCode.Nederlands, id).then(soundUrl => {
            promptPlayer.addEventListener('loadeddata', _ => {
            setAudioPlayerStatus(_target, 'playing');
            promptPlayer.play();
            });
            promptPlayer.addEventListener('error', _ => {
            setAudioPlayerStatus(_target, 'stopped');
            console.log('Error: ', error);
            });
            promptPlayer.addEventListener('ended', _ => {
            setAudioPlayerStatus(_target, 'stopped');
            });
            promptPlayer.src = soundUrl;
        }).catch(error => {
            setAudioPlayerStatus(_target, 'stopped');
            console.log('Error: ', error);
        });
    };
    
    if (!audioIsPlaying) {
        setAudioPlayerStatus(_target, 'loading');
        _playPrompt(props.currentvalue);
    } else {
        promptPlayer.pause();
        setAudioPlayerStatus(_target, 'stopped');
    }
}

onMounted(() => {
    promptPlayer  = new Audio();
});
</script>

<template>
  <div data-e2e="ui-play-audio">
    <a class="button__icon button__icon-play--small" @click="playAudio">
        <span v-html="playerIcon.play"></span>
    </a>
  </div>
</template>
