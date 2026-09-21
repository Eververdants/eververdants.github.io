/* React binding for the framework-free prefs store in ./prefs. */
import { useSyncExternalStore } from "react";
import { getPrefs, subscribePrefs, type Prefs } from "./prefs";

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribePrefs, getPrefs, getPrefs);
}

export type { Prefs } from "./prefs";
export { setLang, setTheme, toggleTheme } from "./prefs";
