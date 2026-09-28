import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Link } from '@react-email/components';

interface AdminBookingAlertProps {
  customerName: string;
  customerEmail: string;
  className: string;
  date: string;
  time: string;
  durationMins: number;
  paymentLabel: string;
  providerName: string;
  joinLink?: string;
  startLink?: string;
  meetingId?: string;
  passcode?: string;
}

export const AdminBookingAlertEmail = ({
  customerName,
  customerEmail,
  className,
  date,
  time,
  durationMins,
  paymentLabel,
  providerName,
  joinLink,
  startLink,
  meetingId,
  passcode,
}: AdminBookingAlertProps) => {
  return (
    <Html>
      <Head />
      <Preview>New Booking: {className} by {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Breathe Write Admin Alert</Text>
          </Section>
          <Section style={content}>
            <Text style={title}>New Session Booking</Text>
            <Text style={text}>
              A new booking has been confirmed for <strong>{className}</strong>.
            </Text>

            <div style={detailsBox}>
              <Text style={detailText}><strong>Customer:</strong> {customerName} ({customerEmail})</Text>
              <Text style={detailText}><strong>Class:</strong> {className}</Text>
              <Text style={detailText}><strong>Date:</strong> {date}</Text>
              <Text style={detailText}><strong>Time:</strong> {time} (UK time)</Text>
              <Text style={detailText}><strong>Duration:</strong> {durationMins} minutes</Text>
              <Text style={detailText}><strong>Payment:</strong> {paymentLabel}</Text>
              {meetingId && <Text style={detailText}><strong>Meeting ID:</strong> {meetingId}</Text>}
              {passcode && <Text style={detailText}><strong>Passcode:</strong> {passcode}</Text>}
            </div>

            {startLink && joinLink ? (
              <>
                <Text style={text}>
                  <strong>{providerName} host link</strong>
                  {providerName === 'Google Meet' ? ' (open it while signed in to the Google account connected in the admin dashboard)' : ''}:
                </Text>
                <Link href={startLink} style={button}>
                  Start {providerName} Session (Host)
                </Link>
                <Text style={footerText}>
                  Customer Join Link: <Link href={joinLink}>{joinLink}</Link>
                </Text>
              </>
            ) : (
              <Text style={text}>
                <strong>The online meeting could not be created automatically.</strong> Please create it manually and send the joining link to the customer, then check that Google (or Zoom) is connected on the admin dashboard.
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminBookingAlertEmail;

const main = {
  backgroundColor: '#F7F6F2',
  fontFamily: 'Helvetica, Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const header = {
  padding: '32px 0',
  textAlign: 'center' as const,
};

const logo = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#2E3337',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
};

const content = {
  backgroundColor: '#ffffff',
  padding: '40px',
  borderRadius: '8px',
};

const title = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#2E3337',
  marginBottom: '20px',
};

const text = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#2E3337',
  marginBottom: '20px',
};

const detailsBox = {
  backgroundColor: '#F7F6F2',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
};

const detailText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#2E3337',
  margin: '4px 0',
};

const button = {
  backgroundColor: '#4A6FA5',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '30px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: 'bold',
  marginBottom: '24px',
};

const footerText = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#6A7382',
};
