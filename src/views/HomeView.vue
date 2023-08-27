<script lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
export default {
    setup() {
        const searchInput = ref('');
        const router = useRouter();
        const searchHandler = () => {
            router.push({
                name: 'result', query: { location: searchInput.value }
            })
        }
        return {
            searchHandler,
            searchInput
        }
    },
}
</script>
<template lang="pug">
div#home-page.flex.flex-col.items-center.min-h-screen.pt-20.pb-5
    h1.pb-5.text-3xl Weather Forecast
    input(
        type="text",
        name="search",
        placeholder="search city name",
        class="w-60 m-5 p-2 text-xs text-center rounded-xl bg-gray-200 placeholder-gray-500",
        @keydown.enter="searchHandler",
        v-model="searchInput"
    )
    div.flex.flex-col.items-center.mt-auto
        a(href="https://www.weatherapi.com/", title="Free Weather API")
            img.w-20(src="//cdn.weatherapi.com/v4/images/weatherapi_logo.png")
        p.text-sm Powered by 
            a(href="https://www.weatherapi.com/", title="Free Weather API", class="underline") WeatherAPI.com
</template>
<style></style>