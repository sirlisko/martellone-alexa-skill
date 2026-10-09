import type { RequestEnvelope } from "ask-sdk-model";
import { describe, expect, it } from "vitest";
import { AUDIO_URL, handler, skill } from "./index";

const envelope = (request: object, locale = "en-GB") =>
  ({
    version: "1.0",
    session: {
      new: true,
      sessionId: "session",
      application: { applicationId: "skill" },
      user: { userId: "user" },
    },
    context: {
      System: {
        application: { applicationId: "skill" },
        user: { userId: "user" },
        apiEndpoint: "https://api.eu.amazonalexa.com",
      },
    },
    request: { requestId: "request", timestamp: new Date().toISOString(), locale, ...request },
  }) as RequestEnvelope;

const intent = (name: string, locale?: string) =>
  envelope({ type: "IntentRequest", intent: { name, confirmationStatus: "NONE" } }, locale);

const invoke = async (requestEnvelope: RequestEnvelope) =>
  (await skill.invoke(requestEnvelope)).response;

describe("martellone skill", () => {
  it.each([
    ["launch", envelope({ type: "LaunchRequest" })],
    ["StiCazziIntent", intent("StiCazziIntent")],
    ["FallbackIntent", intent("AMAZON.FallbackIntent")],
  ])("plays the clip and ends the session on %s", async (_, requestEnvelope) => {
    const response = await invoke(requestEnvelope);
    expect(response.outputSpeech).toMatchObject({ ssml: `<speak><audio src="${AUDIO_URL}"/></speak>` });
    expect(response.shouldEndSession).toBe(true);
  });

  it("keeps the session open on help", async () => {
    const response = await invoke(intent("AMAZON.HelpIntent"));
    expect(response.reprompt).toBeDefined();
    expect(response.shouldEndSession).toBe(false);
  });

  it("answers help in Italian for it-IT", async () => {
    const response = await invoke(intent("AMAZON.HelpIntent", "it-IT"));
    expect(response.outputSpeech).toMatchObject({ ssml: expect.stringContaining("Cosa vuoi chiedergli") });
  });

  it.each(["AMAZON.StopIntent", "AMAZON.CancelIntent", "AMAZON.NavigateHomeIntent"])(
    "ends the session without the clip on %s",
    async (name) => {
      const response = await invoke(intent(name));
      expect(response.outputSpeech).toMatchObject({ ssml: "<speak>Ciao!</speak>" });
      expect(response.shouldEndSession).toBe(true);
    },
  );

  it("returns no speech on SessionEndedRequest", async () => {
    const response = await invoke(envelope({ type: "SessionEndedRequest", reason: "USER_INITIATED" }));
    expect(response.outputSpeech).toBeUndefined();
  });

  it("exposes an async handler, as the Node.js 24 Lambda runtime rejects callback-style ones", async () => {
    expect(handler.length).toBeLessThan(3);
    await expect(handler(envelope({ type: "LaunchRequest" }), {})).resolves.toHaveProperty("response");
  });
});
