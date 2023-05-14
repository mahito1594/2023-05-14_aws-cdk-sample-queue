import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import axios from "axios";

const BASE_URL = process.env.BASE_URL;
const secretName = "sample-auth";

const getSecrets = async () => {
  const client = new SecretsManagerClient({ region: "ap-northeast-1" });
  const command = new GetSecretValueCommand({
    SecretId: secretName,
  });

  const result = await client.send(command);
  return JSON.parse(result.SecretString || "");
};

const isSecretParams = (
  secrets: unknown
): secrets is { userId: string; password: string } => {
  if (secrets == null) {
    return false;
  }

  const accesible = secrets as Record<string, unknown>;
  return (
    typeof accesible.userId === "string" &&
    typeof accesible.password === "string"
  );
};

const encodeBasicAuth = (id: string, password: string) => {
  const raw = `${id}:${password}`;
  const encoded = Buffer.from(raw).toString("base64");

  return encoded;
};

export const getAccessToken = async () => {
  const secrets = await getSecrets();
  if (!isSecretParams(secrets)) {
    throw new Error("We cannot get secret parameters");
  }

  const { userId, password } = secrets;
  const basicAuth = encodeBasicAuth(userId, password);

  const result = await axios
    .get<{ authenticated: boolean; user: string }>(`/${userId}/${password}`, {
      baseURL: BASE_URL,
      headers: { Authorization: `Basic ${basicAuth}` },
    })
    .then((res) => {
      if (res.statusText !== "OK") {
        console.error("Authentication Fail");
        return { ok: false };
      }
      return { ok: true, data: res.data };
    })
    .catch((err) => {
      console.error(err);
      return { ok: false };
    });

  /** httpbin.org/basic-auth は別にアクセストークンを返してくれるわけではない */
  // return result.data;
  return { ok: true, accessToken: basicAuth };
};
