<template>
  <div :class="dialogStatus" data-e2e="confirm-modal">
    <div :class="windowStatus" id="dialog-window">
      <div class="dialog__window-header dialog__window-header--important dialog__window-header--transparent">
        <span>{{ header }}</span>
      </div>
      <div class="dialog__window-body">
        <div class="grid-row" v-html="bodyContent"></div>  
      </div>
      <div class="grid-unit--alpha dialog__window-footer dialog__window-footer--confirm">
        <a class="button-primary button-primary--important dialog__window-ok" @click="doAccept">{{ acceptLabel }}</a>
        <a class="button-primary dialog__window-cancel" @click="doCanceled">{{ cancelLabel }}</a> 
      </div>   
    </div>
  </div>
</template>

<script>

export default {
	name: 'ConfirmBox',
	props: ['status', 'header', 'bodyContent', 'acceptLabel', 'cancelLabel'],
	computed: {
		dialogStatus() {
			let _class = 'dialog__modal';
			if(this.$props.status)
				_class += ' dialog__modal--open';

			return _class;
		},
		windowStatus() {
			let _class = 'dialog__window dialog__window--w500';
			if(this.$props.status)
				_class += ' dialog__window--open';

			return _class;
		},
	},
	methods: {
		doAccept() {
		this.$emit('accepted');
		},
		doCanceled() {
		this.$emit('canceled');
		},
	}
}

</script>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/mixins";
  @use "@/scss/includes/functions";

  .dialog__modal {
    position: absolute;
    opacity: 0;
    z-index: globals.$level-message;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0,0,0,.2);
    transition: opacity .2s ease-in-out;
    pointer-events: none;
    overflow: hidden;
    &--open {
      opacity: 1;
      pointer-events: auto;
    }
    &--second {
      z-index: 6010;
    }
    &--fixed {
      position: fixed;
    }
  }

  .dialog__window {
    position: absolute;
    background-color: globals.$color-white;
    left: 50%;
    top: -150%;
    width: 96%;
    max-width: 1044px;
    height: auto;
    z-index: 10;
    box-shadow: 0 0 25px 0 rgba(0,0,0,.2);
    transform: translate(-50%,-50%);
    transition: top .5s ease-in-out;
    transform-origin: 0 50%;
    &--open {
      top: 40px;
      transform: translate(-50%, 0);
    }
    &-alert {
      top: 50%;
      width: 450px;
    }
    &-icon {
      position: absolute;
      width: 45px;
      height: 45px;
      display: block;
      margin: 0 auto;
    }
    &-icon:before {
      content: '\F120';
      position: absolute;
      font-family: 'Material Design Icons';
      font-weight: normal;
      font-style: normal;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 32px;
      height: 50px;
      line-height: 48px;
      text-indent: -10px;
      overflow: hidden;
      color: functions.tint(globals.$color-interaction, 50%);
      font-size: 54px;
    }
    &-number {
      display: block;
      flex: 1 0 60%;
      padding-left: 70px;
      @include font.font-bold();
      color: globals.$color-gray80;
      font-size: 1rem;
      @include mixins.chopToLongText(100%);
      padding-bottom: 5px;
    }
    &-time {
      @include font.font-bold();
      font-size: 0.9rem;
      display: block;
      flex: 0 1 40%;
      text-align: right;
      padding-bottom: 5px;
      color: globals.$color-secondary;
    }
    &-name {
      display: block;
      flex: 0 1 100%;
      padding-left: 70px;
      color: globals.$color-gray60;
      font-size: 0.9rem;
      @include mixins.chopToLongText(100%);
    }
    &--newrole {
      width: 450px; 
    }
    &--w400 {
      max-width: 400px; 
    }
    &--w500 {
      max-width: 500px; 
    }
    &--w680 {
      max-width: 680px; 
    }
    &--prompt {
      top: 30%;
      width: 400px;
    }
  }

  .dialog__window-header,
  .dialog__window-body,
  .dialog__window-footer {
    position: relative;
    display: block;
    margin: 0 1.5rem;
    padding: 1rem 0.5rem;
    width: calc(100% - 3rem);
    float: left;
  }

  .dialog__window-header {
    height: 45px;
    width: 100%;
    color: globals.$color-gray50;
    background-color: globals.$color-gray10;
    margin: 0;
    padding-left: 1.5rem;
    padding-right: calc(45px + 1.5rem);
    span {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
    &--important {
      color: globals.$color-unavailable;
      @include font.font-bold();
    }
    &--transparent {
      background-color: transparent;
    }
  }

  .dialog__window-body {
    padding: .5rem .5rem 1rem .5rem;
    margin-left: -.25rem;
    width: calc(100% + .5rem);
    p {
      padding: 1rem 2rem .5rem 2rem;
      text-align: center;
    }
    &--roles {
      h2,
      p {
        text-align: left;
        color: globals.$color-gray50;
        @include font.font-light();
      }
      h2 {
        font-size: 1.1rem;
      }
      p {
        padding: .2rem 0;
        font-size: .8rem;
      }
    }
    &--message {
      margin-left: 0;
      padding: 1.25rem;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      width: 100%;
      p {
        text-align: left;
        color: globals.$color-gray50;
        @include font.font-light();
        padding: .2rem 0;
        font-size: .9rem;
      }
    }
    
  }

  .dialog__window-footer {
    padding: 1rem 0 1.5rem 0rem;
    text-align: right;
    margin-right: -5px;
    border-top: 1px solid globals.$color-gray10;
    .dialog__window-nav {
      background-color: globals.$color-gray35;
    }
    .dialog__window-ok,
    .dialog__window-save,
    .dialog__window-dontsave,
    .dialog__window-cancel {
      margin: 10px 5px;
    }
    .dialog__window-cancel {
      margin-right: 0;
      background-color: globals.$color-gray25;
      &:hover {
        background-color: globals.$color-gray35;
      } 
    }
    .dialog__window-button--right {
      float: left;
      margin-left: -20px;
    }
    &--confirm {
      border-top: none;
      .dialog__window-ok,
      .dialog__window-save,
      .dialog__window-dontsave,
      .dialog__window-cancel {
        background-color: transparent;
        color: globals.$color-gray50;
        box-shadow: none;
        &:hover {
          color: globals.$color-gray80;
          background-color: transparent;
        } 
      }
      .dialog__window-ok,
      .dialog__window-save {
        color: globals.$color-unavailable;
        &:hover {
          color: functions.tint(globals.$color-unavailable, 50%);
        }
        &--disabled {
          opacity: .2;
          &:hover {
            color: globals.$color-unavailable;
          }
        } 
      }
    }
    &--message {
      border-top: none;
      .dialog__window-accept {
        background-color: globals.$color-secondary;
        &:hover {
          background-color: globals.$color-secondary;
        }
      }
      .dialog__window-cancel {
        background-color: globals.$color-unavailable;
        &:hover {
          background-color: globals.$color-unavailable;
        }
      }
    }
  }

  .dialog__window-divider {
    position: relative;
    display: block;
    width: 100%;
    height: 1px;
    border: none;
    background-color: globals.$color-gray10;
  }

  .dialog__window-close {
    position: absolute;
    top: 50%;
    right: 0;
    width: 45px;
    height: 45px;
    transform: translateY(-50%);
    display: block;
    z-index: 10001;
    cursor: pointer;
    span {
      content: "";
      position: absolute;
      background-color: globals.$color-gray25;
      width: 60%;
      height: 2px;
      border-radius: 2px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%)
                rotate(45deg);
      &:nth-child(2) {
        transform: translate(-50%, -50%)
                  rotate(-45deg);
      }
    }
  }

</style>
