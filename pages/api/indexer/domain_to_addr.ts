import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";

export type domainToAddrData = { addr: string; domain_expiry: number };
export type queryError = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<domainToAddrData | queryError>
) {
  const {
    query: { domain },
  } = req;
  const { db } = await connectToDatabase();
  await db
    .collection("domains")
    .findOne({
      domain: domain,
      "_chain.valid_to": null,
    })
    .then((domainDoc) => {
      res
        .setHeader("cache-control", "max-age=60")
        .status(200)
        .json(
          domainDoc
            ? { addr: domainDoc.addr, domain_expiry: domainDoc.expiry }
            : { error: "no address found" }
        );
    });
}