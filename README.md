# useWatchStorage Hook

## Overview

The useWatchStorage hook provides a convenient way to synchronize Vue reactive state with browser storage (either localStorage or sessionStorage). This enables data persistence across sessions and tabs while automatically updating the stored value when changes occur.

## Installation

```bash
yarn add @devbylucas/use-watch-storage
```

## Parameters

- `key (string)`: The key under which the value will be stored in the browser storage.
- `initialValue (Value)`: The initial value to be stored if no value is found under the specified key.
- `options (object, optional)`: Additional configuration options.
  storage (boolean): If true, the hook will use localStorage. Defaults to true.
  session (boolean, optional): If true, the hook will use sessionStorage instead of localStorage.

## Return Value

- `storedValue (Ref)`: A reactive reference to the stored value.
- `updateStoredValue (function)`: A function to update the stored value. Accepts a single parameter representing the new value.

## Usage

```javascript
import { useWatchStorage } from '@devbylucas/use-watch-storage';

<script setup>
  const [storedValue, setValue] = useWatchStorage('key', 'initialValue');
  // value is now reactive and will be stored in localStorage under the key 'key'

  setValue('newValue');
  //or
  state.value = 'newValue';
  // value is now 'newValue' and is stored in localStorage

</script>

<template>
  <div>{{ value }}</div>
</template>

```

## Behavior

- On component mount, the hook retrieves the stored value from the browser storage if available, falling back to the provided initialValue.
- Changes to the stored value are automatically synchronized with the browser storage.
- If changes are made in another tab or window, the hook listens for storage events and updates the stored value accordingly.
- The hook also includes a fallback mechanism to watch for changes within the same tab via a requestAnimationFrame loop.

## Error Handling

- If errors occur during storage operations (e.g., parsing JSON), appropriate error messages are logged to the console.
- Optionally, the hook can revert to the initial value in case of errors.

## Dependencies

@vue/reactivity: For reactive state management in Vue.
lodash: For utility functions such as deep equality comparison.

## Notes

Avoid using setInterval for watching storage changes, as it may consume excessive resources and slow down the browser.
