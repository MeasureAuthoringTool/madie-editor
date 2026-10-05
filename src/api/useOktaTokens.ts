const getField = (storageKey, field) => {
  const storageStr = window.localStorage.getItem(storageKey);
  if (storageStr) {
    try {
      const storage = JSON.parse(storageStr);
      if (storage && storage[field]) {
        return storage[field];
      }
    } catch (error) {
      console.error(
        "An error occurred while trying to read the okta-token-storage object",
        error
      );
    }
  }
  return null;
};

const getAccessTokenObj = (storageKey) => {
  return getField(storageKey, "accessToken");
};

const getIdTokenObj = (storageKey) => {
  return getField(storageKey, "idToken");
};

export function decodeJWT(token: string) {
  if (!token || typeof token !== "string") return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    // Replace URL-safe Base64URL characters and restore required padding
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "==".slice(0, (4 - (base64.length % 4)) % 4);

    // Decode UTF-8 bytes via percent-encoding — works in all environments
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

const useOktaTokens = (storageKey = "okta-token-storage") => {
  return {
    getAccessToken: () => getAccessTokenObj(storageKey)?.accessToken,
    getAccessTokenObj: () => getAccessTokenObj(storageKey),
    getUserName: () => {
      const accessTokenObj: any = getAccessTokenObj(storageKey);
      if (typeof accessTokenObj?.accessToken === "string") {
        return decodeJWT(accessTokenObj.accessToken)?.sub ?? null;
      }
      return null;
    },
    getIdToken: () => getIdTokenObj(storageKey)?.idToken,
    getIdTokenObj: () => getIdTokenObj(storageKey),
  };
};

export default useOktaTokens;
