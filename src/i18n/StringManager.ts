import type { ReadOnlyProperty } from "scenerystack/axon";
import { LocalizedString } from "scenerystack/chipper";
import stringsEn from "./strings_en.json";
import stringsEs from "./strings_es.json";
import stringsFr from "./strings_fr.json";

// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEn satisfies typeof stringsFr);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsFr satisfies typeof stringsEn);

const stringProperties = LocalizedString.getNestedStringProperties({
  en: stringsEn,
  fr: stringsFr,
  es: stringsEs,
});

export class StringManager {
  private static instance: StringManager | null = null;

  private constructor() {}

  public static getInstance(): StringManager {
    if (StringManager.instance === null) {
      StringManager.instance = new StringManager();
    }
    return StringManager.instance;
  }

  public getTitleStringProperty(): ReadOnlyProperty<string> {
    return stringProperties.titleStringProperty;
  }

  public getScreenNames(): {
    readonly ptolemaicStringProperty: ReadOnlyProperty<string>;
    readonly configurationsStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      ptolemaicStringProperty: stringProperties.screens.ptolemaicStringProperty,
      configurationsStringProperty: stringProperties.screens.configurationsStringProperty,
    };
  }

  public getPtolemaicStrings() {
    return stringProperties.ptolemaic;
  }

  public getConfigurationsStrings() {
    return stringProperties.configurations;
  }

  public getPtolemaicA11yStrings() {
    return stringProperties.a11y.ptolemaic;
  }

  public getConfigurationsA11yStrings() {
    return stringProperties.a11y.configurations;
  }

  public getPreferences() {
    return stringProperties.preferences;
  }
}
