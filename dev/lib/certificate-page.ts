import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getCertificate } from "./backend";
import { isValidId } from "./certificate-id";

/** URLのIDで証明書を取る。形式が違うか見つからなければ404 */
export const loadCertificate = cache(async (id: string) => {
  const certificate = isValidId(id) ? getCertificate(id) : undefined;
  if (!certificate) notFound();
  return certificate;
});
