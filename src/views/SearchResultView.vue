<script lang="ts">
import { useFetch } from '../composables/fetch';
import { useRoute, useRouter } from 'vue-router';
import { ref } from 'vue';

export default {
    setup() {
        const route = useRoute();
        const location = ref(route.query.location || 'Taipei');
        const apiKey = 'db64f5b7a0a34f70a1590014232208';
        const WeatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location.value}&days=10`;
        const { data: weatherData, error: weatherError, notFound } = useFetch(WeatherApiUrl);
        const router = useRouter();
        const homeButtonHandler = () => {
            router.push('/');
        }
        return {
            weatherData,
            weatherError,
            notFound,
            homeButtonHandler
        }
    },
}
</script>
<template lang="pug">
div#result-page.flex.flex-col.items-center.min-h-screen.pt-20.pb-5
    button.absolute.top-5.left-5.text-3xl.cursor-pointer(@click="homeButtonHandler")
        i.fa-solid.fa-angle-left.text-stone-800
    template(v-if="weatherData && !notFound")
        div.flex.flex-col.items-center.font-sans.main-text-shadow
            p.text-2xl.mb-1 {{ weatherData.location.name }}
            p.text-7xl.font-thin.mb-2.temp {{ weatherData.current.temp_c }}
            p.text-base {{ weatherData.current.condition.text }}
            div.flex.text-base.gap-2
                p H:{{ weatherData.forecast.forecastday[0].day.maxtemp_c }}°
                p L:{{ weatherData.forecast.forecastday[0].day.mintemp_c }}°
    template(v-else-if="notFound")
        p.text-2xl No matching location found.
    template(v-else-if="weatherError")
        p Error: {{ weatherError }}
    template(v-else)
        p.text-2xl loading...
</template>
<style scoped lang="scss">
#result-page {
    color: #eee;

    .temp::after {
        content: '°';
        position: absolute;
    }
}
</style>