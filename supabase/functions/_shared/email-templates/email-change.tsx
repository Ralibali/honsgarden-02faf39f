/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ siteName, email, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Bekräfta byte av e-postadress för Hönsgården</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://sikbymtrbhrofysgkqsj.supabase.co/storage/v1/object/public/email-assets/logo-honsgarden.png" width="140" height="auto" alt="Hönsgården" style={logo} />
        <Heading style={h1}>Bekräfta byte av e-post</Heading>
        <Text style={text}>
          Du har begärt att byta e-postadress för Hönsgården från{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
          till{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
        </Text>
        <Text style={text}>Klicka på knappen nedan för att bekräfta ändringen:</Text>
        <Button style={button} href={confirmationUrl}>
          Bekräfta e-postbyte
        </Button>
        <Text style={footer}>
          Om du inte begärde detta, skydda ditt konto omedelbart.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Young Serif', Georgia, serif" }
const container = { padding: '30px 25px' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(22, 18%, 12%)', margin: '0 0 20px' }
const text = { fontSize: '14px', color: 'hsl(22, 12%, 44%)', lineHeight: '1.6', margin: '0 0 25px', fontFamily: "'Inter', Arial, sans-serif" }
const link = { color: 'hsl(142, 32%, 34%)', textDecoration: 'underline' }
const button = { backgroundColor: 'hsl(142, 32%, 34%)', color: 'hsl(35, 32%, 97%)', fontSize: '14px', borderRadius: '14px', padding: '12px 24px', textDecoration: 'none', fontFamily: "'Inter', Arial, sans-serif" }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', fontFamily: "'Inter', Arial, sans-serif" }
