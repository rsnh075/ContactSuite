
<template>
    <div class="notloggedin-wrapper">
        <div class="notloggedin-header">
            <h2>Unexpected error:</h2>
        </div>
        <div class="notloggedin-body">
            <p>Please refresh or contact your support team.</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: '404',
        inject: ['showLoader'],
        updated() {
            this.showLoader(false);
        },
        mounted() {
            this.showLoader(false);
        }
    }
</script>

<style lang="scss" scoped>

@use "@/scss/includes/functions" as fn;
@use "@/scss/includes/globals";
.notloggedin-wrapper, .app-wrapper {
    z-index: 10000;
    width: 300px;
    height: 200px;
    background-color: globals.$color-white;
    margin: 0 auto;
    margin-top: 30vh;
    border-radius: 3px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
    .notloggedin-header {
        background-color: globals.$color-gray7;
        width: 100%;
        padding: 10px 16px 10px 16px;
        h2 {
            color: globals.$color-gray60;
            font-size: 1.2rem;
        }
    }
    .notloggedin-body {
        padding: 15% 0 0 0;
        text-align: center;
        p {
            color: globals.$color-gray60;
            font-size: .9rem;
        }
    }
}

</style>