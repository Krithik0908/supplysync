import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import ReactPDF, { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 50 },
  title: { fontSize: 20, textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 15 },
  heading: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  text: { fontSize: 11, lineHeight: 1.5 },
});

const createPaymentReminderPDF = (analysisData: any) =>
  React.createElement(
    Document, null,
    React.createElement(
      Page, { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.title }, 'Payment Reminder'),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.heading }, 'Date:'),
        React.createElement(Text, { style: styles.text }, new Date().toLocaleDateString())
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.heading }, 'Analysis Summary:'),
        React.createElement(Text, { style: styles.text }, `Purpose: ${analysisData.purpose}`),
        React.createElement(Text, { style: styles.text }, `Payment Delayed: ${analysisData.paymentDelayed ? 'Yes' : 'No'}`),
        React.createElement(Text, { style: styles.text }, `Risk Level: ${analysisData.riskLevel}`),
        React.createElement(Text, { style: styles.text }, `Suggested Action: ${analysisData.suggestedAction}`)
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.heading }, 'Drafted Reply:'),
        React.createElement(Text, { style: styles.text }, analysisData.draftedReply)
      )
    )
  );

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { analysisData } = await req.json();
    const pdfStream = await ReactPDF.renderToStream(
      createPaymentReminderPDF(analysisData)
    );
    const pdfBuffer = await streamToBuffer(pdfStream as NodeJS.ReadableStream);
    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=payment-reminder.pdf',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}