/*
I CREATED THIS HOOK BECAUSE I LIKE TO USE HOOK-TS AND I DIDN'T FIND ANYTHING LIKE SO FOR VUE 3, SO I CREATED IT 
*/

import { onMounted, onUnmounted, MaybeRefOrGetter, ref, UnwrapRef, Ref, watch } from "vue"
import _ from "lodash"

export type Value<T> = MaybeRefOrGetter<T>
export function useWatchStorage<T>(key: string, initialValue: Value<T>, options: { storage: boolean; session?: boolean } = { storage: true }): [Ref<T>, (value: T) => void] {
  const storedValue = ref<T>(initialValue as T)
  const storage = options.session ? window.sessionStorage : window.localStorage

  const updateStoredValue = (value: T) => {
    try {
      if (typeof value !== typeof storedValue.value) {
        throw new Error("The type of the stored value is different from the new value")
      }
      storage.setItem(key, JSON.stringify(value))
      storedValue.value = value as UnwrapRef<T>

      // the storage event just work when the storage is changed in another tab or window
      // Im managing to work on the same tab and the same window
      // so let's suppose that the user is using another tab and change the storage, both tabs will be updated
      // Manually trigger the storage event
      const storageEvent = new Event("storage")
      window.dispatchEvent(storageEvent)
    } catch (error: any) {
      console.error(`Error on setting storage item ${key}, ${error.message}`)
      // Optionally revert the value to the initial value
      storedValue.value = initialValue as UnwrapRef<T>
    }
  }

  const getStorageValue = (): UnwrapRef<T> | null => {
    try {
      const stored = storage.getItem(key)
      if (stored) {
        return JSON.parse(stored) as UnwrapRef<T>
      }
      return null
    } catch (error: any) {
      console.error(`Error on getting storage item ${key}, ${error.message}`)
      return null
    }
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === key) {
      try {
        const newValue = JSON.parse(event.newValue as string) as T

        if (typeof newValue !== typeof storedValue.value) {
          throw new Error("The type of the stored value is different from the new value")
        }
        if (!_.isEqual(storedValue, newValue)) {
          storedValue.value = newValue as UnwrapRef<T>
          storage.setItem(key, JSON.stringify(newValue))
        }
      } catch (error: any) {
        console.error(`Error on handling sotrage item ${key}, ${error.message}`)
        // Optionally revert the value to the initial value
        storedValue.value = initialValue as UnwrapRef<T>
      }
    }
  }

  // this block of code handle the changes in the storedValue when the value is mutated, like, storedValue.value = 'new value'
  watch(storedValue, (newvalue) => {
    updateStoredValue(newvalue as T)
  })

  onMounted(() => {
    try {
      const stored = getStorageValue()
      if (stored) {
        storedValue.value = stored as UnwrapRef<T>
        return
      }

      storage.setItem(key, JSON.stringify(initialValue))
    } catch (error: any) {
      console.error(`Error on getting storage item ${key}, ${error.message}`)
      // Optionally revert the value to the initial value
      storedValue.value = initialValue as UnwrapRef<T>
      storage.setItem(key, JSON.stringify(initialValue))
    }
    window.addEventListener("storage", handleStorageChange, false)
  })

  onUnmounted(() => {
    window.removeEventListener("storage", handleStorageChange)
  })

  // Watch for changes in localStorage within the same tab via a fallback mechanism
  // NOTE: dont use setInterval, it will consume a lot of resources and slow down the browser, own experience lol
  const localStorageFallback = () => {
    const currentStored = localStorage.getItem(key)
    try {
      if (!currentStored) {
        throw new Error("No storage item found")
      }
      const newValue = JSON.parse(currentStored as string) as T

      // check if the newValue type is different from the storedValue type
      if (typeof newValue !== typeof storedValue.value) {
        throw new Error("The type of the stored value is different from the new value")
      }

      if (!_.isEqual(storedValue, newValue)) {
        storedValue.value = newValue as UnwrapRef<T>
      }
    } catch (error: any) {
      console.error(`Error parsing storage item ${key}, ${error.message}`)
      // Optionally revert the value to the initial value
      storedValue.value = initialValue as UnwrapRef<T>
      storage.setItem(key, JSON.stringify(initialValue))
    }
    requestAnimationFrame(localStorageFallback)
  }

  requestAnimationFrame(localStorageFallback)

  return [storedValue as Ref<T>, updateStoredValue]
}
