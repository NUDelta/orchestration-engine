import got from "got";
import { studioAPIUrl } from "../../index.js";

/**
 * GET request wrapper for the Studio API.
 * @param subdomain string specific route to run GET request on.
 * @param searchParams optional object search parameters to pass in URL to GET request. Default is empty.
 * @param retryLimit optional amount of times to retry request if it fails.
 * @returns {CancelableRequest<Response<unknown>>} promise with request.
 */
export const getFromStudioAPI = async (subdomain, searchParams={}, retryLimit=3) => {
  return got.get(
    `${ studioAPIUrl }/${ subdomain }`,
    {
      searchParams: searchParams,
      responseType: 'json',
      retry: {
        limit: retryLimit,
        methods: ["GET"]
      }
    });
};

/**
 * POST request wrapper for the Studio API.
 * @param subdomain string specific route to run GET request on.
 * @param jsonBody optional object data to send to route. Default is empty.
 * @param retryLimit optional amount of times to retry request if it fails.
 * @returns {CancelableRequest<Response<unknown>>} promise with request.
 */
export const postToStudioApi = async (subdomain, jsonBody={}, retryLimit=3) => {
  return got.post(
    `${ studioAPIUrl }/${ subdomain }`,
    {
      json: jsonBody,
      responseType: "json",
      retry: {
        limit: retryLimit,
        methods: ["POST"]
      }
    }
  );
};
