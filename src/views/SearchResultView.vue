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
                    astro: {
                        sunrise: string;
                        sunset: string;
                    }
                    day: {
                        maxtemp_c: number;
                        mintemp_c: number;
                        condition: {
                            icon: string;
                        };
                    };
                    hour: {
                        temp_c: number;
                        condition: {
                            icon: string;
                        }
                    }[]
                }[];
            };
        }
        const route = useRoute();
        const router = useRouter();
        const showList = ref(false);

        // get weather api data
        const location = ref(route.query.location || 'Taipei');
        const apiKey = 'db64f5b7a0a34f70a1590014232208';
        const WeatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location.value}&days=10`;
        const { data: weatherData, error: weatherError, notFound } = useFetch<WeatherData>(WeatherApiUrl);

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const fixedLocation = ref(null)

        // collate hourly forecast data
        const hourlyForecast = computed(() => {
            const date = new Date();
            const now = ref(date.getHours());
            const currentDate = ref(0);
            const { sunrise, sunset, sunriseDay, sunsetDay } = getSunriseSunsetTime(date) ?? {};
            const result = [];
            while (true) {
                // now + 24hours + sunrise and sunset time = 27
                if (result.length > 26) break;
                // turn to next day
                if (now.value > 23) {
                    currentDate.value = 1;
                    now.value = 0;
                }
                const data = weatherData?.value?.forecast.forecastday[currentDate.value].hour[now.value];
                result.push({
                    hour: now.value.toString().padStart(2, '0'),
                    temp: Math.round(data?.temp_c ?? 0) + '°',
                    icon: data?.condition.icon
                });
                // add the sunrise data 
                if (Number(sunrise?.split(':')[0]) === now.value && sunriseDay === currentDate.value) {
                    result.push({
                        hour: sunrise,
                        temp: "Sunrise",
                        icon: "../../sunrise.png"
                    });
                }
                // add the sunset data 
                if (Number(sunset?.split(':')[0]) === now.value && sunsetDay === currentDate.value) {
                    result.push({
                        hour: sunset,
                        temp: "Sunset",
                        icon: "../../sunset.png"
                    });
                }
                now.value++;
            }
            result[0].hour = 'Now';

            return result;
        });

        // get sunrise and sunset time
        const getSunriseSunsetTime = (date: Date) => {
            const data = weatherData?.value?.forecast.forecastday;
            if (!data) return null;

            // get current day sunrise and sunset time
            const [currentSunrise, currentSunset] = [
                convertTo24HourFormat(data[0].astro.sunrise),
                convertTo24HourFormat(data[0].astro.sunset)
            ];

            const [year, month, day] = [
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            ];

            const [sunriseHours, sunriseMinutes] = currentSunrise.split(':').map(Number);
            const [sunsetHours, sunsetMinutes] = currentSunset.split(':').map(Number);

            let result = {
                sunrise: currentSunrise,
                sunset: currentSunset,
                sunriseDay: 0,
                sunsetDay: 0,
            };

            // update properties of the 'result' object based on sunrise and sunset time
            if (date < new Date(year, month, day, sunriseHours, sunriseMinutes)) {
                return result;
            } else if (date < new Date(year, month, day, sunsetHours, sunsetMinutes)) {
                result.sunrise = convertTo24HourFormat(data[1].astro.sunrise);
                result.sunriseDay = 1;
            } else {
                result.sunrise = convertTo24HourFormat(data[1].astro.sunrise);
                result.sunset = convertTo24HourFormat(data[1].astro.sunset);
                result.sunriseDay = 1;
                result.sunsetDay = 1;
            }
            return result;

            function convertTo24HourFormat(timeString: string) {
                const [time, period] = timeString.split(' ');
                let [hours, minutes] = time.split(':');
                let newHours = parseInt(hours, 10);
                if (period === 'PM' && newHours !== 12) {
                    newHours += 12;
                } else if (period === 'AM' && newHours === 12) {
                    newHours = 0;
                }
                return `${newHours.toString().padStart(2, '0')}:${minutes}`;
            }
        }

        // select filter day
        const selectFilterDay = (num: number) => {
            numOfDays.value = num;
        }

        // filter weather forecast
        const numOfDays = ref(3);
        const filterWeatherForecast = computed(() => {
            return weatherData.value?.forecast.forecastday.slice(0, numOfDays.value);
        })

        // get max temperature and min temperature and computed per temperature distance 
        const temperatureValues = computed(() => {
            const result = filterWeatherForecast.value?.reduce((acc, obj) => {
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

        // draw the temperature line
        const tempLineDisplayHandler = (maxtemp: number, mintemp: number) => {
            const { maxTemp, minTemp, distance } = temperatureValues.value ?? { maxTemp: 0, minTemp: 0, distance: 0 };
            const leftDistance = (Math.round(mintemp) - minTemp) * distance;
            const rightDistance = (maxTemp - Math.round(maxtemp)) * distance;
            return `left:${leftDistance}px; right:${rightDistance}px;`;
        }

        // draw the temperature line background
        const tempLineBgHandler = (mintemp: number) => {
            const { minTemp, distance } = temperatureValues.value ?? { maxTemp: 0, minTemp: 0, distance: 0 };
            const leftDistance = (Math.round(mintemp) - minTemp) * distance;
            return `left:-${leftDistance}px;`;
        }

        const homeButtonHandler = () => {
            router.push('/');
        }

        return {
            showList,
            weatherData,
            weatherError,
            notFound,
            daysOfWeek,
            hourlyForecast,
            temperatureValues,
            numOfDays,
            filterWeatherForecast,
            fixedLocation,
            selectFilterDay,
            getSunriseSunsetTime,
            tempLineDisplayHandler,
            tempLineBgHandler,
            homeButtonHandler
        }
    },
}
</script>
<template lang="pug">
div#result-page.flex.flex-col.items-center.min-h-screen.px-4.pb-5.overflow-hidden(@click="showList = false")
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
        section.w-full.max-w-sm.px-3.pb-1.mb-3.backdrop-brightness-95.rounded-lg
            div.opacity-70.text-left.text-xs.leading-8.section-title
                i.fa-solid.fa-clock.px-1
                | HOURLY FORECAST
            div.flex.overflow-x-scroll.gap-7.w-full.text-xs
                div(v-for="data of hourlyForecast" :key="data.hour"
                    class="flex flex-col items-center justify-between w-10 leading-7")
                    div {{ data.hour }} 
                    div.w-8: img.w-8.m-0(:src="data.icon")
                    div.text-base.leading-8 {{ data.temp }}
        section.w-full.max-w-sm.px-3.backdrop-brightness-95.rounded-lg
            table.w-full.leading-10.relative(style="transform-style: preserve-3d;")
                thead.z-10.relative.ios-z-index-1: tr: th.text-left.text-xs.leading-8(colspan="3")
                    div.flex.items-center
                        i.fa-solid.fa-calendar-days.px-1.opacity-70
                        span.opacity-70 {{numOfDays}}-DAY-FORECAST
                        button(@click.stop="showList = !showList"
                            class=" bg-gray-600 text-gray-200 leading-relaxed ml-auto px-1 rounded-sm opacity-95 relative") 天數(選單)
                            Transition(name="slide-fade")
                                ul(v-show="showList" 
                                class="bg-gray-700 absolute w-16 right-px overflow-hidden top-8 rounded-sm z-10 filter-list ios-z-index-1")
                                    li(v-for="num of 3" :key="num" @click="selectFilterDay(num)"
                                    class="section-title leading-7 filter-list-item relative") {{ num }} 日
                tbody.z-0.relative.ios-z-index-0
                    tr(v-for="(data, index) of filterWeatherForecast" :key="data.date")
                        td(colspan="1" style="width:55%") {{ index === 0 ? 'Today' : daysOfWeek[new Date(data.date).getDay()] }}
                        td(style="width:45%")
                            img.w-8.m-0(:src="data.day.condition.icon")
                        td(style="width:183px").flex.items-center.justify-center.gap-2
                            span.opacity-60 {{ Math.round(data.day.mintemp_c) }}°
                            .temp-line-wrapper
                                .temp-line(:style="tempLineDisplayHandler(data.day.maxtemp_c,data.day.mintemp_c)" class="z-0")
                                    .temp-line-bg.z-0(:style="tempLineBgHandler(data.day.mintemp_c)")
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
    tbody>tr:not(:last-child),
    .section-title {
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

    .filter-list {
        .filter-list-item {

            &:hover {
                backdrop-filter: brightness(0.75);
            }
        }

    }

    .temp::after {
        content: '°';
        position: absolute;
    }

    //for ios z-index
    .ios-z-index-0 {
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        -moz-transform: translateZ(0);
        -o-transform: translateZ(0);
    }

    .ios-z-index-1 {
        transform: translateZ(1px);
        -webkit-transform: translateZ(1px);
        -moz-transform: translateZ(1px);
        -o-transform: translateZ(1px);
    }

    .slide-fade-enter-active,
    .slide-fade-leave-active {
        transition: all 0.5s ease;
    }

    .slide-fade-enter-to,
    .slide-fade-leave-from {
        height: 86.4px;
    }

    .slide-fade-enter-from,
    .slide-fade-leave-to {
        opacity: 0;
        height: 0px;
    }
}

@media(min-width: 500px) {
    ::-webkit-scrollbar {
        height: 4px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #33333333;
        border-radius: 20px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: #11111133;
    }

}
</style>