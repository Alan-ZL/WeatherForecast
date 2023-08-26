import { ref, Ref } from 'vue'

interface FetchResult<T> {
    data: Ref<T | null>,
    error: Ref<any | null>
}

export function useFetch<T>(url: string): FetchResult<T> {
    const data: Ref<T | null> = ref(null)
    const error: Ref<any | null> = ref(null)

    fetch(url)
        .then((res) => res.json())
        .then((json) => (data.value = json))
        .catch((err) => (error.value = err))

    return { data, error }
}