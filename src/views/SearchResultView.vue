<script lang="ts">
import { useFetch } from '../composables/fetch';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed } from 'vue';

export default {
    setup() {
        interface WeatherData {
            location: {
                name: string;
            };
            current: {
                temp_c: number;
                condition: {
                    text: string;
                };
            };
            forecast: {
                forecastday: {
                    date: string;
                    day: {
                        maxtemp_c: number;
                        mintemp_c: number;
                        condition: {
                            icon: string;
                        };
                    };
                }[];
            };
        }

        const route = useRoute();
        const router = useRouter();
        const location = ref(route.query.location || 'Taipei');
        const apiKey = 'db64f5b7a0a34f70a1590014232208';
        const WeatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location.value}&days=10`;
        const { data: weatherData, error: weatherError, notFound } = useFetch<WeatherData>(WeatherApiUrl);
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const temperatureValues = computed(() => {
            const result = weatherData?.value?.forecast.forecastday.reduce((acc, obj) => {
                if (obj.day.maxtemp_c > acc.maxTemp) {
                    acc.maxTemp = Math.round(obj.day.maxtemp_c);
                    acc.distance = 115 / (acc.maxTemp - acc.minTemp + 1)
                }
                if (obj.day.mintemp_c < acc.minTemp) {
                    acc.minTemp = Math.round(obj.day.mintemp_c);
                    acc.distance = 115 / (acc.maxTemp - acc.minTemp + 1)
                }
                return acc;
            }, { maxTemp: -Infinity, minTemp: Infinity, distance: 0 });
            if (result)
                result.distance = 115 / (result?.maxTemp - result?.minTemp + 1);
            return result;
        });
        const tempLineDisplayHandler = (maxtemp: number, mintemp: number) => {
            const { maxTemp, minTemp, distance } = temperatureValues.value ?? { maxTemp: 0, minTemp: 0, distance: 0 };
            const leftDistance = (Math.round(mintemp) - minTemp) * distance;
            const rightDistance = (maxTemp - Math.round(maxtemp)) * distance;
            return `left:${leftDistance}px; right:${rightDistance}px;`;
        }
        const tempLineBgHandler = (mintemp: number) => {
            const { minTemp, distance } = temperatureValues.value ?? { maxTemp: 0, minTemp: 0, distance: 0 };
            const leftDistance = (Math.round(mintemp) - minTemp) * distance;
            return `left:-${leftDistance}px;`;
        }
        const homeButtonHandler = () => {
            router.push('/');
        }
        return {
            weatherData,
            weatherError,
            notFound,
            daysOfWeek,
            temperatureValues,
            tempLineDisplayHandler,
            tempLineBgHandler,
            homeButtonHandler
        }
    },
}
</script>
<template lang="pug">
div#result-page.flex.flex-col.items-center.min-h-screen.px-4.pb-5
    button.absolute.top-5.left-5.text-3xl.cursor-pointer(@click="homeButtonHandler")
        i.fa-solid.fa-angle-left.text-stone-800
    template(v-if="weatherData && !notFound")
        div.flex.flex-col.items-center.font-sans.mb-16.main-text-shadow.pt-20
            p.text-2xl.mb-1 {{ weatherData.location.name }}
            p.text-7xl.font-thin.mb-2.temp {{ weatherData.current.temp_c }}
            p.text-base {{ weatherData.current.condition.text }}
            div.flex.text-base.gap-2
                p H:{{ Math.round(weatherData.forecast.forecastday[0].day.maxtemp_c) }}°
                p L:{{ Math.round(weatherData.forecast.forecastday[0].day.mintemp_c) }}°
        section.w-full.max-w-sm.px-3.backdrop-brightness-95.rounded-lg
            table.w-full.leading-10
                thead: tr: th.opacity-70.text-left.text-xs.leading-8(colspan="3")
                    i.fa-solid.fa-calendar-days.px-1
                    | 10-DAY-FORECAST
                tbody 
                    tr(v-for="(data, index) of weatherData.forecast.forecastday" :key="index")
                        td(colspan="1",style="width:55%") {{ index === 0 ? 'Today' : daysOfWeek[new Date(data.date).getDay()] }}
                        td(style="width:45%"): img.w-8.m-0(:src="data.day.condition.icon")
                        td(style="width:183px").flex.items-center.justify-center.gap-2
                            span.opacity-60 {{ Math.round(data.day.mintemp_c) }}°
                            .temp-line-wrapper: .temp-line(:style="tempLineDisplayHandler(data.day.maxtemp_c,data.day.mintemp_c)")
                                .temp-line-bg(:style="tempLineBgHandler(data.day.mintemp_c)")
                            span {{ Math.round(data.day.maxtemp_c) }}°
    template(v-else-if="notFound")
        p.text-2xl.pt-20 No matching location found.
    template(v-else-if="weatherError")
        p.text-2xl.pt-20 Error: {{ weatherError }}
    template(v-else)
        p.text-2xl.pt-20 loading...
</template>
<style scoped lang="scss">
#result-page {
    color: #eee;

    thead>tr,
    tbody>tr:not(:last-child) {
        border-bottom: 1px solid #cccccc33;
    }

    .temp-line-wrapper {
        width: 100%;
        height: 4px;
        background: #33333333;
        position: relative;

        .temp-line {
            background: linear-gradient(to right, #9ed3ab, #bfd38c, #ffc600, #ff9301, #ff7a1c);
            position: absolute;
            overflow: hidden;
            height: 100%;
            border-radius: 3px;

            .temp-line-bg {
                display: block;
                position: relative;
                width: 115px;
                height: 100%;
                background: inherit;
            }

        }
    }

    .temp::after {
        content: '°';
        position: absolute;
    }
}
</style>