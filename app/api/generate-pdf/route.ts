import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
  },
});

// PDF Document
const createPaymentReminderPDF = (analysisData: any) =>
  React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.title }, 'Payment Reminder'),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.heading }, 'Date:'),
        React.createElement(Text, { style: styles.text }, new Date().toLocaleDateString())
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.heading }, 'Analysis Summary:'),
        React.createElement(Text, { style: styles.text }, `Purpose: ${analysisData.purpose}`),
        React.createElement(
          Text,
          { style: styles.text },
          `Payment Delayed: ${analysisData.paymentDelayed ? 'Yes' : 'No'}`
        ),
        React.createElement(Text, { style: styles.text }, `Risk Level: ${analysisData.riskLevel}`),
        React.createElement(Text, { style: styles.text }, `Suggested Action: ${analysisData.suggestedAction}`)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.heading }, 'Drafted Reply:'),
        React.createElement(Text, { style: styles.text }, analysisData.draftedReply)
      )
    )
  );

export async function POST(req: NextRequest) {
  try {
    const { analysisData } = await req.json();

    // Render PDF to stream
    const pdfStream = await ReactPDF.renderToStream(
      createPaymentReminderPDF(analysisData)
    );

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      pdfStream.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      pdfStream.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename=payment-reminder.pdf',
            },
          })
        );
      });
      pdfStream.on('error', (err) => {
        console.error('Stream error:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}