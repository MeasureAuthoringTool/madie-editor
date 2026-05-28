import DOMPurify from "dompurify";

const wafIntercept = (error) => {
  // Check for WAF block
  if (
    error?.response?.status === 403 &&
    error?.response?.headers["content-type"]
      .toLowerCase()
      .includes("text/html") &&
    (JSON.stringify(error.response.data)
      .toLocaleLowerCase()
      .includes("soc@hcqis.org") ||
      JSON.stringify(error.response.data)
        .toLowerCase()
        .includes("qnet_soc@cms.hhs.gov"))
  ) {
    // eslint-disable-next-line no-console
    console.log("WAF Interceptor Triggered");

    const supportID = error.response.data.includes("ID:")
      ? error.response.data.split("ID:")[1].split("<br>")[0].trim()
      : "";
    const body = error.response.data.split("<body>")[1].split("<br>")[0];
    const purifiedBody = DOMPurify.sanitize(body, { ALLOWED_TAGS: [] });

    const wafEvent = new CustomEvent("wafReject", {
      detail: { message: purifiedBody, supportId: supportID },
    });
    document.dispatchEvent(wafEvent);
    throw new Error(purifiedBody); // no tags allowed, removes all HTML tags.
  }
  return Promise.reject(error);
};
export default wafIntercept;
