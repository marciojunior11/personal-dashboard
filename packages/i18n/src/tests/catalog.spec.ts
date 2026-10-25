import { describe, expect, it } from "vitest";
import { CATALOGS, MessageCode, SUPPORTED_LOCALES } from "../catalog.js";
import { BILLING_MESSAGES } from "../locales/pt-BR/billing.messages.js";
import { COMMON_MESSAGES } from "../locales/pt-BR/common.messages.js";
import { IDENTITY_MESSAGES } from "../locales/pt-BR/identity.messages.js";

const MODULES = [COMMON_MESSAGES, IDENTITY_MESSAGES, BILLING_MESSAGES];

describe("catalog", () => {
  it("never reuses a code across modules", () => {
    // A repeated code would silently overwrite another module's message.
    const codes = MODULES.flatMap((messages) => Object.keys(messages));
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("exposes every code by name", () => {
    expect(Object.keys(MessageCode).sort()).toEqual(
      Object.keys(CATALOGS["pt-BR"]).sort(),
    );
    expect(MessageCode.EMAIL_INVALID).toBe("EMAIL_INVALID");
  });

  it("has a non-empty message for every code in every locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const code of Object.keys(MessageCode)) {
        expect(CATALOGS[locale][code as MessageCode]).not.toBe("");
      }
    }
  });
});
