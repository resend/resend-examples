/**
 * Contact Form Confirmation Email
 *
 * Sent to users after they submit a contact form to confirm
 * their message was received.
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components';

interface ContactConfirmationEmailProps {
  /** The sender's name */
  name: string;
  /** Copy of their original message */
  message: string;
}

export function ContactConfirmationEmail({
  name,
  message,
}: ContactConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>We received your message - Acme</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-12 px-4 max-w-xl">
            <Text className="text-2xl font-bold text-black">Acme</Text>

            <Heading className="text-2xl font-bold text-gray-900 mt-8">
              Thanks for reaching out, {name}!
            </Heading>

            <Text className="text-base text-gray-700 leading-6">
              We&apos;ve received your message and will get back to you within
              24-48 hours.
            </Text>

            <Hr className="border-gray-200 my-6" />

            {/* Copy of their message */}
            <Text className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Your message:
            </Text>
            <Text className="text-base text-gray-700 leading-6 bg-gray-50 p-4 rounded-md">
              {message}
            </Text>

            <Hr className="border-gray-200 my-6" />

            <Text className="text-sm text-gray-500">
              This is an automated confirmation. Please don&apos;t reply to this
              email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ContactConfirmationEmail.PreviewProps = {
  name: 'Jane Smith',
  message:
    "Hi, I'm interested in learning more about your enterprise plan. Can we schedule a call?",
} satisfies ContactConfirmationEmailProps;

export default ContactConfirmationEmail;
