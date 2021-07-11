import I18n from "i18n-js";
import * as RNLocalize from "react-native-localize";

import en from "./en";
import ro from "./ro";

const locales = RNLocalize.getLocales();

if (Array.isArray(locales)) {
  I18n.locale = "en";
}

I18n.fallbacks = true;
I18n.translations = {
  en,
  ro
};

export default I18n;