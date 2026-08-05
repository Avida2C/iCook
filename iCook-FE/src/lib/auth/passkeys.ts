/**
 * Browser WebAuthn helpers for the local auth stand-in.
 * Registration/assertion use the real platform authenticator (Face ID,
 * Windows Hello, etc.). Verification is credential-id based (no server).
 */

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  bytes.forEach((b) => {
    str += String.fromCharCode(b);
  });
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBuffer(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function randomChallenge(size = 32): ArrayBuffer {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes.buffer;
}

export function passkeysSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.PublicKeyCredential &&
    typeof navigator.credentials?.create === "function"
  );
}

export type CreatedPasskey = {
  credentialId: string;
  name: string;
};

export async function registerPasskey(
  userEmail: string,
  userName: string,
): Promise<CreatedPasskey> {
  if (!passkeysSupported()) {
    throw new Error("Passkeys are not supported in this browser.");
  }

  const userId = new TextEncoder().encode(userEmail.toLowerCase());
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: {
        name: "iCook",
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: userEmail,
        displayName: userName || userEmail,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("Passkey registration was cancelled.");

  const credentialId = bufferToBase64url(credential.rawId);
  const ua = navigator.userAgent;
  let name = "This device";
  if (/iPhone|iPad/i.test(ua)) name = "iPhone · Face ID";
  else if (/Macintosh/i.test(ua)) name = "Mac · Touch ID";
  else if (/Windows/i.test(ua)) name = "Windows Hello";
  else if (/Android/i.test(ua)) name = "Android · Screen lock";

  return { credentialId, name };
}

export async function assertPasskey(
  credentialIds: string[],
): Promise<string> {
  if (!passkeysSupported()) {
    throw new Error("Passkeys are not supported in this browser.");
  }
  if (credentialIds.length === 0) {
    throw new Error("No passkeys registered for this account.");
  }

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: randomChallenge(),
      rpId: window.location.hostname,
      allowCredentials: credentialIds.map((id) => ({
        type: "public-key" as const,
        id: base64urlToBuffer(id),
      })),
      userVerification: "required",
      timeout: 60_000,
    },
  })) as PublicKeyCredential | null;

  if (!assertion) throw new Error("Passkey sign-in was cancelled.");

  return bufferToBase64url(assertion.rawId);
}
