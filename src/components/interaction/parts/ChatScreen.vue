<template>
	<teleport to="#internalchat" data-e2e="ChatScreen">
		<div :class="windowStatus" ref="chatWindow" :style="styleMe">
			<header class="chat-window__header">
				<div :class="unreadMsgShow">{{ unreadMsg }}</div>
				<div class="chat-window__header-title" ref="chatWindowHeader">{{ chatHeader }}</div>
				<button type="button" class="chat-window__header-minimize" @click.prevent.stop="toggleMinimizeAndDockWindow" v-html="minimizeIcon"></button>
				<button type="button" class="chat-window__header-close" @click.prevent.stop="closeChat()">&#xF5AD;</button>
			</header>
			<main class="chat-window__body">
				<div class="chat-window__body-chat-history" ref="historyBox" v-on:scroll="resetUnreadMsg">
					<div v-for="msg in chatMessages" :key="msg.keyid" :class="msg.who" v-html="msg.txt"></div>
				</div>
				<div v-if="canAnswer === true">
					<textarea name="answer" :class="sendBtnToggle" @keyup.enter="sendAnswer($event)" @keyup="setSendBtn($event)" ref="answerBox" :placeholder="store.state.settings.chat.defaultanswertext"></textarea>
					<button :class="sendActive" @click.prevent.stop="sendFromBtn()">&#xF48A;</button>
				</div>
			</main>
		</div>
	</teleport>
</template>

<script lang="ts">

import raf                    	from 'raf';
import { ref, reactive }		from '@vue/reactivity';
import {
			computed,
			defineComponent,
			nextTick,
			onMounted,
			watch
		}						from '@vue/runtime-core';
import { useStore }             from 'vuex';
import { IPCCCContacts }		from '../../../ipccc/js/contacts';
import { IPCCCInternalChat }	from '../../../ipccc/js/internalchat';

const	WINDOW_STACK_SHIFT_LEFT   = 20,
		WINDOW_STACK_SHIFT_RIGHT  = 30,
		WINDOW_MINIMIZED_STARTPOS = 40,
		WINDOW_MINIMIZED_SPACING  = 325,
		WINDOW_HEIGHT             = 340;

export default defineComponent({
	name: 'ChatScreen',
	props: ['chatdata', 'status', 'chatwindowindex', 'styleMe' , 'dockCount', 'canAnswer'],
	emits: ['isClosed', 'isDocked', 'isDragged'],
	setup(props, { emit }) {
		const 	store:object | any  = useStore(),
				myUserId            = store.state.loginSession.Details.UserId,
				senderUserId        = ref(-1),
				customerId          = ref(-1),
				isDocked            = ref(true),
				isActive            = ref(true),
				answerBox           = ref<HTMLInputElement>(null),
				historyBox          = ref<HTMLInputElement>(null),
				msgToSend           = ref(''),
				chatWindow          = ref<HTMLInputElement>(null),
				chatWindowHeader    = ref<HTMLInputElement>(null),
				animationSpeed      = ref(3),
				unreadMsg           = ref(0),
				chatHeader          = ref(''),
				chatMessages        = ref([]),
				chatStatus          = ref(false),
				chatWindowFloatPos  = reactive({
					_x : 0,
					_y : 0,
				}),
				chatWindowRightPos  = ref(0),
				lastMessageSender   = ref(''),
				chatWindowSize      = reactive({
					_width  : 0,
					_height : 0,
				}),
				incomingchat        = ref(0);

		watch(() => props.chatdata, (newVal, oldVal) => {
			if(!isActive.value) {
				toggleMinimizeAndDockWindow();
				isActive.value = true;
			}
			chatReceived(newVal);
		});

		watch(() => props.status, (newVal, oldVal) => {
		    if(newVal) {
				isActive.value   = true;
				chatStatus.value = true;
				isDocked.value   = false;
				moveWindow(chatWindowFloatPos);
				window.addEventListener('resize', reposWindow, false);
		    }
		});

		const windowStatus = computed(() =>  {
		    let _class = 'chat-window';

		    _class += (isDocked.value)   ? ' chat-window--docked'   : '';
		    _class += (chatStatus.value) ? ' chat-window--isActive' : '';

		    return _class;
		});

		const minimizeIcon = computed(() =>  {
		    return (isDocked.value) ? '&#xF5B2' : '&#xF5B0';
		});

		const sendActive = computed(() =>  {
		    let _class = 'chat-window__body-chat-send';
		    if(answerBox.value) {
		      _class += (msgToSend.value != '') ? ' chat-window__body-chat-send--active' : '';
		    }
		    return _class;
		});

		const sendBtnToggle = computed(() =>  {
		    let _class = 'chat-window__body-chat-answer';
		    if(answerBox.value) {
		      _class += (msgToSend.value != '') ? ' chat-window__body-chat-answer--hasbutton' : '';
		    }
		    return _class;
		});

		const unreadMsgShow = computed(() =>  {
		    let _class = 'chat-window__unreadmsg';
		    _class += (unreadMsg.value > 0) ? ' chat-window__unreadmsg--show' : '';
		    return _class;
		});

		const  toggleMinimizeAndDockWindow = () => {
		    if(isDocked.value) {
				isDocked.value = false;
				resetUnreadMsg();
				scrollToBegin();
				chatWindow.value.style.right = '';
				moveWindow(chatWindowFloatPos);
				emit('isDocked', false);
				if(props.canAnswer)
					answerBox.value.focus();
		    } else {
				isDocked.value = true;
				chatWindow.value.style.right = (props.dockCount * WINDOW_MINIMIZED_SPACING) + WINDOW_MINIMIZED_STARTPOS + 'px';
				chatWindow.value.style.left  = '';
				chatWindow.value.style.top   = '';
				emit('isDocked', true);
				if(props.canAnswer)
					answerBox.value.blur();
		    }
		}

		const  closeChat = () => {
		    destroyWindow();
		    store.commit('SET_NEW_CHAT_WINDOW', -1);
		    emit('isClosed', props.chatwindowindex);
		};

		const  destroyWindow = () => {
		    isActive.value              = false;
		    isDocked.value              = true;
		    chatStatus.value            = false;
		    chatWindow.value.style.left = '';
		    chatWindow.value.style.top  = '';
		    window.removeEventListener('resize', reposWindow, false);
		};

		const setSendBtn = (evt) => {
		    msgToSend.value = evt.target.value;
		};

		const sendFromBtn = () => {
		    if(msgToSend.value != '') {
		      let _msg = answerBox.value.value.replace(/\r\n|\r|\n/g, "<br />");
		      answerBox.value.value = msgToSend.value = '';
		      IPCCCInternalChat.Send(createMessageObject(_msg))
		      .catch((e) => console.error(e))
		    }
		};

		const sendAnswer = (evt) => {
		    if(!evt.shiftKey && msgToSend.value != '') {
		      let _target = evt.target,
		          _msg    = _target.value.replace(/\r\n|\r|\n/g, "<br />");

		      _target.value   = msgToSend.value = '';
		      unreadMsg.value  = 0;
		      IPCCCInternalChat.Send(createMessageObject(_msg))
		      .catch((e) => console.error(e))
		    }
		};

		const createMessageObject = (msg) => {
		    return {
				Message            : msg,
				MessageType        : 1,
				MessageVersion     : 1,
				CustomerId         : customerId.value,
				RecipientUserId    : senderUserId.value,
				RecipientGroupId   : -1,
				SenderUserId       : myUserId,
				Id                 : -1,
				incomingchat       : null,
				resizeTimer        : 0
		    }
		};

		const notify = (body, title = 'ContactSuite') => {
			new Notification(title, {
			body: body,
			icon: '/assets/images/cs-icon.png',
			silent: true,
			});
		};

		const chatReceived = (data, first = false) => {
		    let _friendClass       = 'chat-friend';
		    if(data.SenderUserId != myUserId && lastMessageSender.value != 'him') {
		      _friendClass += ' chat-friend--first';
		    }
		    unreadMsg.value += handelUnreadMsg();

		    if((data.SenderUserId != myUserId && lastMessageSender.value != 'him' && !first) || (data.SenderUserId != myUserId && unreadMsg.value > 0) || checkBrowserState()) {
		      incomingchat.value.play();
		      //notify(store.state.settings.notify.newchat + ' ' + chatHeader + ':\n' + data.Message.replace(/<br ?\/?>/g, "\n"));
		      notify(chatHeader.value + ':\n' + data.Message.replace(/<br ?\/?>/g, "\n"));
		    }

		    if(data.Message != '') {
				chatMessages.value.push({
					keyid : chatMessages.value.length,
					txt   : data.Message,
					who   : data.SenderUserId == myUserId ? 'chat-me' : _friendClass
				});
		    }

		    if(data.SenderUserId == myUserId || (data.SenderUserId != myUserId && lastMsgVisible()))
		      scrollToBegin();

		    lastMessageSender.value = data.SenderUserId == myUserId ? 'me' : 'him';

		    if(props.canAnswer) {
		      answerBox.value.focus();
			}
		};

		const getChatFriendName = (recipientUserId) => {
		    return new Promise((resolve, reject) => {
		      	let _cInfo           = store.getters.getCustomerInfo(),
		         	 _user,
		         	 _userName       = store.state.settings.chat.chatdefaultname;

		      	customerId.value     = _cInfo.customerId;

		      	if(store.getters.getAddressList().length == 0) {
		        	IPCCCContacts.UserList()
		        	.then(response => {
		         		store.commit('SET_ADDRESSLIST', response);
		         		_user = response.filter(u => u.UserId == recipientUserId);
		         		if(_user) {
		          			_userName = composeName(_user[0].FirstName, _user[0].InFix, _user[0].LastName);
						}
		         	 	resolve(_userName);
		        	})
		        	.catch(error => {
		        		console.error(error);
		        	});
		    	} else {
		        	_user = store.getters.getAddressList().filter(u => u.UserId == recipientUserId);
		        	if(_user) {
		        		_userName = composeName(_user[0].FirstName, _user[0].InFix, _user[0].LastName);
					}
		        	resolve(_userName);
		    	}
		    });
		};

		const composeName = (fn, inf, ln) => {
		    let fullName = fn + " ";
		    if(inf != '') fullName += inf + " ";
		    fullName += ln;
		    return fullName;
		};

		const scrollToBegin = async () => {
			await nextTick(() => {
                historyBox.value.scrollTop = historyBox.value.scrollHeight;
            });
		};

		const lastMsgVisible = () => {
		    return historyBox.value.scrollTop >= (historyBox.value.scrollHeight - historyBox.value.offsetHeight);
		};

		const handelUnreadMsg = () => {
		    return (isDocked.value || (!isDocked.value && !lastMsgVisible())) ? 1: 0;
		};

		const resetUnreadMsg = () => {
		    if(lastMsgVisible() && !isDocked.value) {
				unreadMsg.value = 0;
		    }
		};

		const dragWindow = elmnt => {
		    let _pos1     = 0,
		        _pos2     = 0,
		        _pos3     = 0,
		        _pos4     = 0,
		        _nwX      = 0,
		        _nwY      = 0;

		    const dragMouseDown = evt => {
				if(!isDocked.value) {
					evt = evt || window.event;
					evt.preventDefault();
					//GET CURSOR POSITION AT START
					_pos3 = evt.clientX;
					_pos4 = evt.clientY;
					elmnt.onmouseup = stopDragElement;
					//CALL FUNCTION IF CURSOR MOVES
					elmnt.onmousemove = elementDrag;

					emit('isDragged', props.chatwindowindex);
					if(props.canAnswer)
					answerBox.value.focus();
					store.commit('SET_IFRAME_LOCK', true);
				}
		    }

		    const elementDrag = evt => {
				evt = evt || window.event;
				evt.preventDefault();

				//CALCULATE NEW CURSOR POSITION
				_pos1 = _pos3 - evt.clientX;
				_pos2 = _pos4 - evt.clientY;
				_pos3 = evt.clientX;
				_pos4 = evt.clientY;
				//SET WINDOWS NEW POSITION
				_nwX = elmnt.offsetLeft - _pos1;
				if(_nwX <= (store.state.windowSize._maxX - chatWindowSize._width) && _nwX >= 0)
					elmnt.style.left = _nwX + "px";

				_nwY = elmnt.offsetTop  - _pos2;
				if(_nwY <= (store.state.windowSize._maxY - chatWindowSize._height) && _nwY >= 0)
					elmnt.style.top  = _nwY + "px";
		    }

		    const stopDragElement = () => {
				//STOP DRAGGING WHEN RELEASED
				elmnt.onmouseup   = null;
				elmnt.onmousemove = null;
				let _objPos = elmnt.getBoundingClientRect();
				chatWindowFloatPos._x = _objPos.left;
				chatWindowFloatPos._y = _objPos.top;
				store.commit('SET_IFRAME_LOCK', false);
		    }

		    if(chatWindowHeader.value) {
				//IF THERE IS A HEADER USE IT:
				chatWindowHeader.value.onmousedown = dragMouseDown;
		    } else {
				//ELSE USE WHOLE DIV:
				elmnt.onmousedown = dragMouseDown;
		    }
		};

		const reposWindow = () => {
			let resizeTimer;
		    clearTimeout(resizeTimer);
		    resizeTimer = setTimeout(() => {
				let _moveIt = false,
					_moveTo = {
						_x : 0,
						_y : 0,
					};
				if( (chatWindowFloatPos._x + chatWindowSize._width) > store.state.windowSize._maxX ) {
					_moveIt    = true;
					_moveTo._x = store.state.windowSize._maxX - chatWindowSize._width;
				} else {
					_moveTo._x = chatWindow.value.getBoundingClientRect().left;
				}
				if( (chatWindowFloatPos._y + chatWindowSize._height) > store.state.windowSize._maxY ) {
					_moveIt    = true;
					_moveTo._y = store.state.windowSize._maxY - chatWindowSize._height;
				} else {
					_moveTo._y = chatWindow.value.getBoundingClientRect().top;
				}
				if(_moveIt) {
					chatWindowFloatPos._x = _moveTo._x;
					chatWindowFloatPos._y = _moveTo._y;
					moveWindow(_moveTo);
				}
		    }, 200);
		};

		// const moveWindow = (toPos, ready) => {
		const moveWindow = (toPos) => {
		    let _objectPos = chatWindow.value.getBoundingClientRect(),
		        _xStep     = (toPos._x - _objectPos.left) / animationSpeed.value,
		        _yStep     = (toPos._y - _objectPos.top)  / animationSpeed.value,
		        _xPos      = _objectPos.left,
		        _yPos      = _objectPos.top,
		        _id        = null,
		        _count     = 0;

		    const frame = () => {
		      if(_count == animationSpeed.value) {
		        raf.cancel(_id);
		        // if(typeof ready === 'function') {
		        //   ready();
		        // }
		      } else {
		        _xPos += _xStep;
		        chatWindow.value.style.left = _xPos + 'px';
		        _yPos += _yStep;
		        chatWindow.value.style.top  = _yPos + 'px';
		        _count++;
		        _id = raf(frame);
		      }
		    }

		    _id = raf(frame);
		};

		const checkBrowserState = () => {
		    let _status = ((document.hidden || document.visibilityState) == 'visible') ? false : true;
		    return _status;
		};

		onMounted(() => {
			let _objPos             = chatWindow.value.getBoundingClientRect();

			//DIMENTIONS TO KEEP CHATWINDOW IN SCREEN
			chatWindowSize._width  = _objPos.width;
			chatWindowSize._height = chatWindowHeader.value.getBoundingClientRect().height;

			window.addEventListener('resize', reposWindow, false);

			dragWindow(chatWindow.value);

			scrollToBegin();

			if(props.status) {
				chatWindowFloatPos._x = ((window.innerWidth / 2)  - (_objPos.width  / 2)) + ((props.chatwindowindex + 1) * WINDOW_STACK_SHIFT_LEFT);
				chatWindowFloatPos._y = ((window.innerHeight / 2) - (WINDOW_HEIGHT / 2)) + ((props.chatwindowindex + 1) * WINDOW_STACK_SHIFT_RIGHT);
				chatWindowRightPos.value += (props.chatwindowindex * WINDOW_MINIMIZED_SPACING) + WINDOW_MINIMIZED_STARTPOS;
				chatHeader.value          = '...';
				chatStatus.value          = props.status;
				senderUserId.value        = props.chatdata.SenderUserId == myUserId ? props.chatdata.RecipientUserId : props.chatdata.SenderUserId;
				getChatFriendName(senderUserId.value).then(header => {
					chatHeader.value        = header;
					toggleMinimizeAndDockWindow();
					chatReceived(props.chatdata, true);
				});
			}

			incomingchat.value     = new Audio();
			incomingchat.value.src = window.siteroot + '/assets/sounds/incomming-chat.wav';
		});

		return {
			store,
			windowStatus, unreadMsg, unreadMsgShow, chatHeader,
			chatWindow, chatWindowFloatPos, chatWindowHeader, answerBox,
			minimizeIcon,
			toggleMinimizeAndDockWindow, closeChat, resetUnreadMsg, setSendBtn, sendAnswer, sendFromBtn,
			historyBox, chatMessages, sendBtnToggle, sendActive, isActive
		}
	}
});

</script>

<style lang="scss" scoped>
  @use "@/scss/includes/chat";
</style>