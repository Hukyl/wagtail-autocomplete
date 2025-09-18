import Cookies from "js-cookie";

function httpRequest(url, { body, csrfConfig, ...customConfig } = {}) {
  // Use provided config or fallback to defaults
  const XSRF_COOKIE_NAME = csrfConfig?.cookieName || "csrftoken";
  const XSRF_HEADER_NAME = csrfConfig?.headerName || "X-CSRFToken";

  const headers = {};
  if (body) {
    if (Cookies.get(XSRF_COOKIE_NAME)) {
      headers[XSRF_HEADER_NAME] = Cookies.get(XSRF_COOKIE_NAME);
    } else {
      const csrfTokenInput = document.querySelectorAll(
        "input[name='csrfmiddlewaretoken']"
      );
      if (csrfTokenInput.length > 0) {
        headers[XSRF_HEADER_NAME] = csrfTokenInput[0].value;
      }
    }
  }

  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = body;
  }

  return window.fetch(url, config).then(async (response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject();
  });
}

const get = (url, params, csrfConfig) =>
  httpRequest(`${url}?${new URLSearchParams(params).toString()}`, {
    csrfConfig,
  });

const post = (url, data, csrfConfig) =>
  httpRequest(url, { body: data, csrfConfig });

export const getSuggestions = ({
  apiBase,
  query,
  type,
  exclude,
  csrfConfig,
}) => {
  const data = new FormData();
  data.set("query", query);
  data.set("type", type);
  data.set("exclude", exclude);
  const url = apiBase + "search/";

  return post(url, data, csrfConfig).then((res) => {
    if (!Array.isArray(res.items)) {
      return Promise.reject();
    }

    return res.items;
  });
};

export const getObjects = ({ apiBase, ids, type, csrfConfig }) => {
  const params = {
    ids,
    type,
  };
  const url = apiBase + "objects/";

  return get(url, params, csrfConfig).then((res) => {
    if (!Array.isArray(res.items)) {
      return Promise.reject();
    }

    return res.items;
  });
};

export const createObject = ({ apiBase, type, value, csrfConfig }) => {
  const data = new FormData();
  data.set("type", type);
  data.set("value", value);
  const url = apiBase + "create/";

  return post(url, data, csrfConfig).then((res) => res);
};
