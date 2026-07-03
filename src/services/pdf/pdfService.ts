import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface RegistrationPdfData {
  participantId: string;
  fullName: string;
  nickname?: string;
  imageUrl?: string | null;
  dateStr: string;
  email: string;
  phone?: string;
  status: string;
  reference?: string;
  eventName?: string;
}

interface VotingReceiptPdfData {
  reference: string;
  participantId: string;
  fullName: string;
  nickname?: string;
  voteCount: number;
  amount: number;
  email: string;
  dateStr: string;
  status: string;
}

/**
 * PDF Generation Service utilizing pdf-lib
 */
export class PdfService {
  /**
   * Generates a Beautiful Registration Certificate / Contestant Entry Pass
   */
  static async generateRegistrationPdf(data: RegistrationPdfData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
    const { width, height } = page.getSize();

    const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Color Palette matching Next Billionaire branding
    const colorDark = rgb(5 / 255, 11 / 255, 20 / 255);       // #050B14
    const colorGold = rgb(197 / 255, 155 / 255, 70 / 255);    // #C59B46
    const colorLightGold = rgb(239 / 255, 207 / 255, 143 / 255); // #EFCF8F
    const colorLight = rgb(250 / 255, 250 / 255, 250 / 255);   // Off-white
    const colorEmerald = rgb(16 / 255, 185 / 255, 129 / 255);  // #10B981

    // Background base
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: colorLight,
    });

    // Decorative Golden Border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: colorGold,
      borderWidth: 1.5,
    });

    // Outer subtle framing
    page.drawRectangle({
      x: 25,
      y: 25,
      width: width - 50,
      height: height - 50,
      borderColor: rgb(220 / 255, 220 / 255, 220 / 255),
      borderWidth: 0.5,
    });

    // Premium Top Header Block
    page.drawRectangle({
      x: 40,
      y: height - 160,
      width: width - 80,
      height: 100,
      color: colorDark,
    });

    // Header Golden Accent line
    page.drawRectangle({
      x: 40,
      y: height - 165,
      width: width - 80,
      height: 5,
      color: colorGold,
    });

    // Brand Name Typography Header
    page.drawText((data.eventName || 'NEXT BILLIONAIRE PATH').toUpperCase(), {
      x: 60,
      y: height - 110,
      size: 24,
      font: fontBold,
      color: colorGold,
    });

    page.drawText('THE TOURNAMENT OF ENTERTAINMENT & INSPIRATION', {
      x: 60,
      y: height - 135,
      size: 9,
      font: fontMono,
      color: rgb(163 / 255, 163 / 255, 163 / 255),
    });

    // Pass Type Tag Ribbon
    page.drawRectangle({
      x: width - 240,
      y: height - 120,
      width: 180,
      height: 30,
      color: colorGold,
    });

    page.drawText('ACCREDITED ENTRY PASS', {
      x: width - 225,
      y: height - 108,
      size: 10,
      font: fontBold,
      color: colorDark,
    });

    // Main Certificate subtitle
    page.drawText('CONTESTANT REGISTRATION PROFILE', {
      x: 40,
      y: height - 205,
      size: 16,
      font: fontBold,
      color: colorDark,
    });

    // Try embedding remote profile image
    let imageEmbedded = false;
    const photoBoxWidth = 140;
    const photoBoxHeight = 160;
    const photoX = 40;
    const photoY = height - 400;

    // Draw Image Placeholder Frame
    page.drawRectangle({
      x: photoX,
      y: photoY,
      width: photoBoxWidth,
      height: photoBoxHeight,
      color: rgb(240 / 255, 240 / 255, 240 / 255),
      borderColor: colorGold,
      borderWidth: 1,
    });

    if (data.imageUrl) {
      try {
        const imgRes = await fetch(data.imageUrl);
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          let embeddedImg;
          
          // Probe image bytes to try decoding gracefully
          try {
            embeddedImg = await pdfDoc.embedPng(arrayBuffer);
          } catch {
            try {
              embeddedImg = await pdfDoc.embedJpg(arrayBuffer);
            } catch (pngJpgError) {
              console.warn('[PDF Service] Embedded decoder raw failed to parse image format:', pngJpgError);
            }
          }

          if (embeddedImg) {
            page.drawImage(embeddedImg, {
              x: photoX + 2,
              y: photoY + 2,
              width: photoBoxWidth - 4,
              height: photoBoxHeight - 4,
            });
            imageEmbedded = true;
          }
        }
      } catch (err) {
        console.warn('[PDF Service] Error pre-fetching and embedding profile photo onto PDF:', err);
      }
    }

    // Fallback if image was not embedded
    if (!imageEmbedded) {
      // Draw a gold star polygon placeholder
      page.drawCircle({
        x: photoX + photoBoxWidth / 2,
        y: photoY + photoBoxHeight / 2 + 10,
        size: 30,
        color: colorDark,
      });

      page.drawText('NBP', {
        x: photoX + photoBoxWidth / 2 - 16,
        y: photoY + photoBoxHeight / 2 + 4,
        size: 14,
        font: fontBold,
        color: colorGold,
      });

      page.drawText('IMAGE ACQUIRED IN CLOUD', {
        x: photoX + 10,
        y: photoY + 25,
        size: 7,
        font: fontMono,
        color: rgb(120 / 255, 120 / 255, 120 / 255),
      });
    }

    // Participant Details Right Panel
    const detailX = 210;
    let detailY = height - 240;

    // Table details label definitions with proper Event Name, Contestant Name, ID, Image tag, contact info (Email and Phone), and date
    const details = [
      { label: 'EVENT VENUE / PLATFORM', val: (data.eventName || 'Next Billionaire Path').toUpperCase(), isBold: true, color: colorGold },
      { label: 'CONTESTANT PATHWAY ID', val: data.participantId, isMono: true, color: colorGold },
      { label: 'OFFICIAL NAME', val: data.fullName, isBold: true },
      { label: 'AUDITION ALIAS / NICKNAME', val: data.nickname ? `@${data.nickname}` : 'N/A' },
      { label: 'COMMUNICATION EMAIL', val: data.email },
      { label: 'COMMUNICATION TELEPHONE', val: data.phone || 'NOT REGISTERED', isMono: true },
      { label: 'ACCREDITATION DATE', val: data.dateStr },
      { label: 'CERTIFICATE SIGNATURE REF', val: data.reference || 'NBP-WEB-ONBOARDING', isMono: true, sizeShort: true },
    ];

    details.forEach((item) => {
      // Label line
      page.drawText(item.label, {
        x: detailX,
        y: detailY,
        size: 8,
        font: fontMono,
        color: rgb(115 / 255, 115 / 255, 115 / 255),
      });

      // Value line
      const valueY = detailY - 14;
      page.drawText(item.val, {
        x: detailX,
        y: valueY,
        size: item.sizeShort ? 9 : 11,
        font: item.isMono ? fontMono : (item.isBold ? fontBold : fontNormal),
        color: item.color || colorDark,
      });

      // Separator rule
      page.drawRectangle({
        x: detailX,
        y: detailY - 24,
        width: width - detailX - 40,
        height: 0.5,
        color: rgb(230 / 255, 230 / 255, 230 / 255),
      });

      detailY -= 35;
    });

    // Verification and Badging Panel
    const bottomBoxY = 190;
    page.drawRectangle({
      x: 40,
      y: bottomBoxY,
      width: width - 80,
      height: 70,
      color: rgb(245 / 255, 245 / 255, 247 / 255),
      borderColor: rgb(220 / 255, 220 / 255, 225 / 255),
      borderWidth: 1,
    });

    page.drawCircle({
      x: 75,
      y: bottomBoxY + 35,
      size: 18,
      color: colorEmerald,
    });

    page.drawText('V', {
      x: 71,
      y: bottomBoxY + 29,
      size: 16,
      font: fontBold,
      color: colorLight,
    });

    page.drawText('VERIFIED STATUS: PAID, ACCREDITED & QUALIFIED', {
      x: 110,
      y: bottomBoxY + 42,
      size: 11,
      font: fontBold,
      color: colorDark,
    });

    page.drawText('This contestant has cleared full registration audit gates. Approved for active platform voting.', {
      x: 110,
      y: bottomBoxY + 20,
      size: 8,
      font: fontNormal,
      color: rgb(100 / 255, 100 / 100, 100 / 255),
    });

    // Barcode Simulation for security credential feeling
    const barcodeX = 40;
    const barcodeY = 70;
    const barcodeWidth = 240;
    page.drawText('SECURITY INTEGRITY AUDIT VALUE', {
      x: barcodeX,
      y: barcodeY + 35,
      size: 7,
      font: fontMono,
      color: rgb(150 / 255, 150 / 255, 150 / 255),
    });

    // Draw barcodes
    for (let i = 0; i < barcodeWidth; i += 4) {
      const isThick = (i % 12 === 0 || i % 20 === 0);
      page.drawRectangle({
        x: barcodeX + i,
        y: barcodeY,
        width: isThick ? 2 : 1,
        height: 25,
        color: colorDark,
      });
    }

    page.drawText(`*NBP-${data.participantId}-${data.reference?.substring(0, 8).toUpperCase() || 'OFFLINE'}*`, {
      x: barcodeX,
      y: barcodeY - 10,
      size: 7,
      font: fontMono,
      color: colorDark,
    });

    // Terms and Fineprint Footer
    const footerY = 70;
    page.drawText('DISCLAIMER & TERMS OF USE', {
      x: width - 260,
      y: footerY + 35,
      size: 7,
      font: fontBold,
      color: colorDark,
    });

    page.drawText('1. Contestants do not access database dashboard interfaces.\n2. Voting limits apply based on public terms decreed.\n3. Ticket reference is immutable and non-transferable.', {
      x: width - 260,
      y: footerY + 10,
      size: 6.5,
      font: fontNormal,
      color: rgb(140 / 255, 140 / 255, 140 / 255),
      lineHeight: 8,
    });

    // Legal footnoting
    page.drawText('NEXT BILLIONAIRE TOURNAMENT SYSTEM SERVICES • ACCREDITATION SERVICE OFFICE', {
      x: 40,
      y: 40,
      size: 6.5,
      font: fontMono,
      color: rgb(160 / 255, 160 / 255, 160 / 255),
    });

    return await pdfDoc.save();
  }

  /**
   * Generates a Beautiful Monetized Voting Receipt / Transaction Pass
   */
  static async generateVotingReceiptPdf(data: VotingReceiptPdfData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
    const { width, height } = page.getSize();

    const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Color Palette matching Next Billionaire branding
    const colorDark = rgb(5 / 255, 11 / 255, 20 / 255);       // #050B14
    const colorGold = rgb(197 / 255, 155 / 255, 70 / 255);    // #C59B46
    const colorLight = rgb(250 / 255, 250 / 255, 250 / 255);   // Off-white
    const colorPrimary = rgb(15 / 255, 118 / 255, 110 / 255);  // Teal-ish Accent

    // Background base
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: colorLight,
    });

    // Decorative Border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: colorGold,
      borderWidth: 1.5,
    });

    // Premium Top Header Block
    page.drawRectangle({
      x: 40,
      y: height - 160,
      width: width - 80,
      height: 100,
      color: colorDark,
    });

    // Header Golden Accent line
    page.drawRectangle({
      x: 40,
      y: height - 165,
      width: width - 80,
      height: 5,
      color: colorGold,
    });

    // Brand Name Typography Header
    page.drawText('NEXT BILLIONAIRE PATH', {
      x: 60,
      y: height - 110,
      size: 24,
      font: fontBold,
      color: colorGold,
    });

    page.drawText('OFFICIAL VOTE TRANSACTION CERTIFIED RECEIPT', {
      x: 60,
      y: height - 135,
      size: 9,
      font: fontMono,
      color: rgb(180 / 255, 180 / 255, 180 / 255),
    });

    // Receipt Type Tag Ribbon
    page.drawRectangle({
      x: width - 240,
      y: height - 120,
      width: 180,
      height: 30,
      color: colorGold,
    });

    page.drawText('VOTING RECEIPT PASS', {
      x: width - 215,
      y: height - 108,
      size: 10,
      font: fontBold,
      color: colorDark,
    });

    // Main Certificate subtitle
    page.drawText('VOTING ALLOCATION AUDIT RECORD', {
      x: 40,
      y: height - 205,
      size: 16,
      font: fontBold,
      color: colorDark,
    });

    // Draw Transaction and Allocation Columns
    const startX = 40;
    let currentY = height - 240;

    const auditDetails = [
      { label: 'VOTE PAYMENT REFERENCE', val: data.reference, isMono: true, color: colorPrimary },
      { label: 'TARGET CONTESTANT ID', val: data.participantId, isMono: true, color: colorGold },
      { label: 'CONTESTANT FULL NAME', val: data.fullName, isBold: true },
      { label: 'CONTESTANT ALIAS', val: data.nickname ? `@${data.nickname}` : 'N/A' },
      { label: 'ALLOCATED VOTE QUANTITY', val: `${data.voteCount.toLocaleString()} VOTES`, isBold: true, color: colorGold },
      { label: 'TRANSACTION TOTAL AMOUNT', val: `GHS ${parseFloat(data.amount.toString()).toFixed(2)}`, isMono: true },
      { label: 'PAYER EMAIL ADDRESS', val: data.email },
      { label: 'TRANSACTION SUCCESS TIME', val: data.dateStr },
    ];

    auditDetails.forEach((item) => {
      // Label line
      page.drawText(item.label, {
        x: startX,
        y: currentY,
        size: 8,
        font: fontMono,
        color: rgb(120 / 255, 120 / 255, 120 / 255),
      });

      // Value line
      const valueY = currentY - 14;
      page.drawText(item.val, {
        x: startX,
        y: valueY,
        size: 11,
        font: item.isMono ? fontMono : (item.isBold ? fontBold : fontNormal),
        color: item.color || colorDark,
      });

      // Separator rule
      page.drawRectangle({
        x: startX,
        y: currentY - 24,
        width: width - 80,
        height: 0.5,
        color: rgb(230 / 255, 230 / 255, 230 / 255),
      });

      currentY -= 38;
    });

    // Integrity Verification and Badging Panel
    const bottomBoxY = 190;
    page.drawRectangle({
      x: 40,
      y: bottomBoxY,
      width: width - 80,
      height: 70,
      color: rgb(240 / 255, 248 / 255, 246 / 255), // light tint of green
      borderColor: rgb(16 / 255, 185 / 255, 129 / 255),
      borderWidth: 1,
    });

    page.drawCircle({
      x: 75,
      y: bottomBoxY + 35,
      size: 18,
      color: rgb(16 / 255, 185 / 255, 129 / 255),
    });

    page.drawText('OK', {
      x: 66,
      y: bottomBoxY + 29,
      size: 14,
      font: fontBold,
      color: colorLight,
    });

    page.drawText('TRANSACTION AUDIT ASSURANCE: SUCCESS & CAPTURED', {
      x: 110,
      y: bottomBoxY + 42,
      size: 11,
      font: fontBold,
      color: colorDark,
    });

    page.drawText('Votes have been successfully credited to the contestant profile. Programmatic duplications are strictly prevented.', {
      x: 110,
      y: bottomBoxY + 20,
      size: 8,
      font: fontNormal,
      color: rgb(100 / 255, 100 / 100, 100 / 255),
    });

    // Barcode Simulation for audit purposes
    const barcodeX = 40;
    const barcodeY = 70;
    const barcodeWidth = 240;
    page.drawText('TRANSACTION INTEGRITY ENVELOPE', {
      x: barcodeX,
      y: barcodeY + 35,
      size: 7,
      font: fontMono,
      color: rgb(150 / 255, 150 / 255, 150 / 255),
    });

    // Draw barcodes
    for (let i = 0; i < barcodeWidth; i += 4) {
      const isThick = (i % 12 === 0 || i % 20 === 0);
      page.drawRectangle({
        x: barcodeX + i,
        y: barcodeY,
        width: isThick ? 2 : 1,
        height: 25,
        color: colorDark,
      });
    }

    page.drawText(`*VT-${data.participantId || 'AUDIT'}-${data.reference.substring(0, 10).toUpperCase()}*`, {
      x: barcodeX,
      y: barcodeY - 10,
      size: 7,
      font: fontMono,
      color: colorDark,
    });

    // Terms and Fineprint Footer
    const footerY = 70;
    page.drawText('DISCLAIMER, TERMS & LAWS', {
      x: width - 260,
      y: footerY + 35,
      size: 7,
      font: fontBold,
      color: colorDark,
    });

    page.drawText('1. No refunds permitted for votes cast under any transaction.\n2. Total allocations are processed with strict idempotence controls.\n3. Legal issues or billing disputes go through direct support.', {
      x: width - 260,
      y: footerY + 10,
      size: 6.5,
      font: fontNormal,
      color: rgb(140 / 255, 140 / 255, 140 / 255),
      lineHeight: 8,
    });

    // Legal footnoting
    page.drawText('NEXT BILLIONAIRE TOURNAMENT FINANCE SYSTEM • VOTE REGULATORY OFFICE', {
      x: 40,
      y: 40,
      size: 6.5,
      font: fontMono,
      color: rgb(160 / 255, 160 / 255, 160 / 255),
    });

    return await pdfDoc.save();
  }
}
