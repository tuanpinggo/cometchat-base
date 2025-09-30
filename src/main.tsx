import ReactDOM from "react-dom/client";
import {
  CometChatUIKit,
  UIKitSettingsBuilder,
} from "@cometchat/chat-uikit-react";
import App from "./App";
import { setupLocalization } from "./CometChat/utils/utils";
import cometChatLogo from "./CometChat/assets/cometchat_logo.svg";
import { CometChatProvider } from "./CometChat/context/CometChatContext";
/**
 * CometChat application constants
 * @constant {Object} COMETCHAT_CONSTANTS
 * @property {string} APP_ID - CometChat application ID
 * @property {string} REGION - CometChat region
 * @property {string} AUTH_KEY - CometChat authentication key
 */
export const COMETCHAT_CONSTANTS = {
  APP_ID: "277407a366096626",
  REGION: "in",
  AUTH_KEY: "954d62cabad621386bdc540edcca1b6ad0fb5778",
};

/**
 * Initialize CometChat if credentials are available, otherwise render the app directly.
 */
if (
  COMETCHAT_CONSTANTS.APP_ID &&
  COMETCHAT_CONSTANTS.REGION &&
  COMETCHAT_CONSTANTS.AUTH_KEY
) {
  const uiKitSettings = new UIKitSettingsBuilder()
    .setAppId(COMETCHAT_CONSTANTS.APP_ID)
    .setRegion(COMETCHAT_CONSTANTS.REGION)
    .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
    .subscribePresenceForAllUsers()
    .build();

  /**
   * Initialize CometChat UIKit and render the application inside the CometChatProvider.
   */
  CometChatUIKit.init(uiKitSettings)?.then(() => {
    setupLocalization();
    const root = ReactDOM.createRoot(
      document.getElementById("root") as HTMLElement
    );
    root.render(
      <CometChatProvider>
        <App />
      </CometChatProvider>
    );
  });
} else {
  /**
   * If credentials are missing, render the app without initializing CometChat.
   */
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  root.render(
    <div className="App" style={{ gap: "20px" }}>
      <div className="cometchat-credentials__logo">
        <img src={cometChatLogo} alt="CometChat Logo" />
      </div>
      <div className="cometchat-credentials__header">
        CometChat App credentials are missing. Please add them in{" "}
        <code>index.tsx</code> to continue.
      </div>
    </div>
  );
}
