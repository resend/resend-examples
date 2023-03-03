import type { NextApiRequest, NextApiResponse } from "next";
import { resend } from "../../lib/resend";
import path from "path";
import fs from "fs";

const send = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST": {
      const invoiceBuffer = await fs.promises.readFile(
        path.join(process.cwd(), "public", "static", "invoice.pdf")
      );

      const data = await resend.sendEmail({
        from: "bu@resend.dev",
        to: "bu@resend.com",
        subject: "Receipt for Your Payment",
        attachments: [
          {
            content: invoiceBuffer,
            filename: "invoice.pdf",
          },
        ],
        html: "<h1>Thanks for the payment</h1>",
        text: "Thanks for the payment",
      });

      return res.status(200).send({ data: "Email sent successfully" });
    }
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default send;
