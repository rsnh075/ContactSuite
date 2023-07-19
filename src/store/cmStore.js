import { createStore }               from 'vuex'

import { cmstore }                   from './cmInitialstore';
import actions                       from './cmActions';
import mutations                     from './cmMutations';
import getters                       from './cmGetters';
  
export const store = createStore({
  state () { return cmstore },
  actions: actions,
  mutations: mutations,
  getters: getters
});
