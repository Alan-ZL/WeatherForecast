<script lang="ts">
import { useFetch } from '../composables/fetch';
import { useRoute } from 'vue-router';
import { ref } from 'vue';
export default {
    setup() {
        const route = useRoute(); // 使用 useRoute 獲取路由相關信息
        const location = ref(route.query.location || 'Taipei');
        const apiKey = 'db64f5b7a0a34f70a1590014232208';
        const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location.value}`;
        const weatherFetchResult = useFetch(weatherApiUrl);
        const weatherData = weatherFetchResult.data;
        const weatherError = weatherFetchResult.error;
        return {
            weatherData,
            weatherError
        }
    },
}
</script>
<template lang="pug">
div#result-page.flex.flex-col.items-center.min-h-screen.pt-10.pb-5
    h1.pb-5.text-3xl Weather Forecast
    template(v-if="weatherData")
        p 城市: {{ weatherData.location.name }}
        p 氣溫: {{ weatherData.current.temp_c }}
        p 天氣: {{ weatherData.current.condition.text }}
        p 最高溫度: {{ weatherData.current.temp_c }}
        p 最低溫度: {{ weatherData.current.temp_c }}
    p Error: {{ weatherError }}
</template>
<style></style>