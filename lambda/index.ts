import {
  ErrorHandler,
  getIntentName,
  getLocale,
  getRequestType,
  HandlerInput,
  RequestHandler,
  SkillBuilders,
} from "ask-sdk-core";
import type { RequestEnvelope } from "ask-sdk-model";

export const AUDIO_URL =
  "https://martellone-alexa-skill-audio.s3.eu-west-1.amazonaws.com/sticazzi.mp3";

const messages = {
  en: {
    help: "Ask Martellone what he thinks about it, and he will tell you. What do you want to ask him?",
    helpReprompt: "Just ask: what do you think about it?",
    goodbye: "Ciao!",
    error: "Sorry, Martellone is not available right now.",
  },
  it: {
    help: "Chiedi a Nando Martellone cosa ne pensa, e te lo dirà. Cosa vuoi chiedergli?",
    helpReprompt: "Chiedigli semplicemente: cosa ne pensi?",
    goodbye: "Ciao!",
    error: "Scusa, Martellone non è disponibile in questo momento.",
  },
};

const t = (input: HandlerInput) =>
  getLocale(input.requestEnvelope)?.startsWith("it") ? messages.it : messages.en;

const isIntent = (input: HandlerInput, ...names: string[]) =>
  getRequestType(input.requestEnvelope) === "IntentRequest" &&
  names.includes(getIntentName(input.requestEnvelope));

// Martellone answers everything the same way, so unrecognised utterances get the clip too.
const StiCazziHandler: RequestHandler = {
  canHandle: (input) =>
    getRequestType(input.requestEnvelope) === "LaunchRequest" ||
    isIntent(input, "StiCazziIntent", "AMAZON.FallbackIntent"),
  handle: (input) =>
    input.responseBuilder
      .speak(`<audio src="${AUDIO_URL}"/>`)
      .withShouldEndSession(true)
      .getResponse(),
};

const HelpHandler: RequestHandler = {
  canHandle: (input) => isIntent(input, "AMAZON.HelpIntent"),
  handle: (input) =>
    input.responseBuilder.speak(t(input).help).reprompt(t(input).helpReprompt).getResponse(),
};

const StopHandler: RequestHandler = {
  canHandle: (input) =>
    isIntent(input, "AMAZON.StopIntent", "AMAZON.CancelIntent", "AMAZON.NavigateHomeIntent"),
  handle: (input) =>
    input.responseBuilder.speak(t(input).goodbye).withShouldEndSession(true).getResponse(),
};

const SessionEndedHandler: RequestHandler = {
  canHandle: (input) => getRequestType(input.requestEnvelope) === "SessionEndedRequest",
  handle: (input) => input.responseBuilder.getResponse(),
};

const errorHandler: ErrorHandler = {
  canHandle: () => true,
  handle: (input, error) => {
    console.error(error);
    return input.responseBuilder.speak(t(input).error).withShouldEndSession(true).getResponse();
  },
};

export const skill = SkillBuilders.custom()
  .addRequestHandlers(StiCazziHandler, HelpHandler, StopHandler, SessionEndedHandler)
  .addErrorHandlers(errorHandler)
  .create();

// SkillBuilder.lambda() returns a callback-style handler, which the Node.js 24 runtime rejects.
export const handler = (event: RequestEnvelope, context: unknown) => skill.invoke(event, context);
