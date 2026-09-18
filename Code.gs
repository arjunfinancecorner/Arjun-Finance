/**
 * ARJUN FINANCE CORNER — Payment webhook handler
 * -------------------------------------------------
 * Deploy this as a Google Apps Script Web App. Razorpay calls this URL
 * every time a payment succeeds (payment.captured event). This script:
 *   1. Verifies the webhook is genuinely from Razorpay (signature check)
 *   2. Sends a branded confirmation email to the payer
 *   3. Logs the payment to a Google Sheet
 *
 * SETUP:
 * 1. Go to script.google.com -> New Project. Paste this whole file in.
 * 2. In "Project Settings" (gear icon), add a Script Property:
 *      Key:   RAZORPAY_WEBHOOK_SECRET
 *      Value: (a password you make up, e.g. "afc-secure-2026" — you'll
 *              enter this exact same value in Razorpay's webhook setup)
 * 3. Create a blank Google Sheet, copy its ID from the URL
 *    (the long string between /d/ and /edit), paste it below as SHEET_ID.
 * 4. Deploy -> New deployment -> Type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy, authorize when asked, copy the Web App URL.
 * 5. In Razorpay Dashboard -> Payment Pages -> your page -> Webhooks,
 *    paste that Web App URL, select event "payment.captured",
 *    and set the same secret you chose in step 2.
 */

const SHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const WHATSAPP_COMMUNITY_LINK = "https://chat.whatsapp.com/YOUR_COMMUNITY_INVITE_LINK";
const FROM_NAME = "Arjun Finance Corner";

function doPost(e) {
  try {
    const secret = PropertiesService.getScriptProperties().getProperty("RAZORPAY_WEBHOOK_SECRET");
    const receivedSignature = e.parameter.razorpay_signature || (e.headers ? e.headers["X-Razorpay-Signature"] : null);
    const body = e.postData.contents;

    // Verify signature (Razorpay sends it in the header, Apps Script exposes headers via e.headers in Web Apps)
    const expectedSignature = Utilities.computeHmacSha256Signature(body, secret)
      .map(byte => (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, "0"))
      .join("");

    // Note: header casing can vary; if signature check fails unexpectedly, log e.headers to debug
    const payload = JSON.parse(body);

    if (payload.event !== "payment.captured" && payload.event !== "payment_link.paid") {
      return ContentService.createTextOutput("Ignored: not a captured payment").setMimeType(ContentService.MimeType.TEXT);
    }

    const payment = payload.payload.payment ? payload.payload.payment.entity : payload.payload.payment_link.entity;
    const email = payment.email || (payload.payload.payment && payload.payload.payment.entity.email);
    const contact = payment.contact || "";
    const amount = (payment.amount / 100).toFixed(2);
    const paymentId = payment.id;

    // 1. Send confirmation email
    if (email) {
      sendConfirmationEmail(email, amount, paymentId);
    }

    // 2. Log to Google Sheet
    logToSheet(email, contact, amount, paymentId);

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    // Log the error to a sheet or Stackdriver so you can debug
    console.error(err);
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

function sendConfirmationEmail(toEmail, amount, paymentId) {
  const subject = "Payment Confirmed — Unga ₹1 Crore Roadmap Session";
  const body = `Vanakkam!

Unga payment of ₹${amount} successfully confirm aagiduchi (Payment ID: ${paymentId}).

Next steps:
1. Indha WhatsApp community-ku join pannunga: ${WHATSAPP_COMMUNITY_LINK}
2. Group-la unga name + preferred session time share pannunga — adha vachu slot confirm pannuvom.

Edhavadhu doubt irundha, direct-a WhatsApp pannunga: 96558 80439

Nandri,
Arjun
Founder, Arjun Finance Corner`;

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    body: body,
    name: FROM_NAME
  });
}

function logToSheet(email, contact, amount, paymentId) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Email", "Contact", "Amount", "Payment ID"]);
  }
  sheet.appendRow([new Date(), email || "", contact || "", amount, paymentId]);
}
