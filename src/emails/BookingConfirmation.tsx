import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Link } from '@react-email/components';

interface BookingConfirmationProps {
  userName: string;
  className: string;
  date: string;
  time: string;
  durationMins: number;
  providerName: string;
  meetLink?: string;
  meetingId?: string;
  passcode?: string;
  inPerson?: boolean;
  location?: string;
}

export const BookingConfirmationEmail = ({
  userName,
  className,
  date,
  time,
  durationMins,
  providerName,
  meetLink,
  meetingId,
  passcode,
  inPerson,
  location,
}: BookingConfirmationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Breathe Write booking is confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Breathe Write</Text>
          </Section>
          <Section style={content}>
            <Text style={title}>Your Session is Confirmed</Text>
            <Text style={text}>Hi {userName},</Text>
            <Text style={text}>
              Thank you for booking <strong>{className}</strong>. We look forward to breathing with you.
            </Text>
            
            <div style={detailsBox}>
              <Text style={detailText}><strong>Date:</strong> {date}</Text>
              <Text style={detailText}><strong>Time:</strong> {time} (UK time)</Text>
              <Text style={detailText}><strong>Duration:</strong> {durationMins} minutes</Text>
              {inPerson && <Text style={detailText}><strong>Format:</strong> In person</Text>}
              {inPerson && location && <Text style={detailText}><strong>Location:</strong> {location}</Text>}
              {meetingId && <Text style={detailText}><strong>Meeting ID:</strong> {meetingId}</Text>}
              {passcode && <Text style={detailText}><strong>Passcode:</strong> {passcode}</Text>}
            </div>

            {inPerson ? (
              <Text style={text}>
                This is an in-person class. Please arrive 10 minutes early so we can start on time.
              </Text>
            ) : meetLink ? (
              <>
                <Text style={text}>
                  Join your session on {providerName} using the link below:
                </Text>
                <Link href={meetLink} style={button}>
                  Join {providerName} Session
                </Link>
                <Text style={footerText}>
                  Or copy this link into your browser: <Link href={meetLink}>{meetLink}</Link>
                </Text>
              </>
            ) : (
              <Text style={text}>
                Your joining link will be sent to you separately before the session.
              </Text>
            )}

            <Text style={footerText}>
              {inPerson
                ? 'We recommend wearing loose, comfortable clothing.'
                : "Please find a quiet, comfortable space where you won't be disturbed. We recommend wearing loose clothing and having a blanket nearby."}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmationEmail;

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
  fontSize: '24px',
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
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2E3337',
  marginBottom: '24px',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#2E3337',
  marginBottom: '24px',
};

const detailsBox = {
  backgroundColor: '#F7F6F2',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
};

const detailText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#2E3337',
  margin: '0',
};

const button = {
  backgroundColor: '#2E3337',
  color: '#F7F6F2',
  padding: '16px 32px',
  borderRadius: '40px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: 'bold',
  marginBottom: '24px',
};

const footerText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#6A7382',
};
